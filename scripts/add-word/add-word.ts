#!/usr/bin/env tsx

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_AI_MODEL } from '../cursor/config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const promptTemplatePath = path.join(
    __dirname,
    '..',
    'cursor',
    'prompts',
    'process-external-words-simple.txt',
);
const runPromptScript = path.join(__dirname, '..', 'cursor', 'run-prompt.mjs');

interface AddWordArgs {
    word?: string;
    languageCode?: string;
    filePath?: string;
}

interface WordData {
    word: string;
    partOfSpeech: string;
    languageCode: string;
    translations: {
        languageCode: string;
        translations: string[];
    }[];
    examples: {
        pronoun: string;
        example: string;
        translations: {
            languageCode: string;
            translation: string;
        }[];
        sentenceTypeCode: string;
        isNegative: boolean;
        isQuestion: boolean;
    }[];
    grammaticalExamples: {
        tenseName: string;
        examples: {
            pronoun: string;
            example: string;
            translations: {
                languageCode: string;
                translation: string;
            }[];
            sentenceTypeCode: string;
            isNegative: boolean;
            isQuestion: boolean;
        }[];
    }[];
}

function parseArgs(): AddWordArgs {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        showUsage();
        process.exit(1);
    }

    if (args.length === 1 && args[0].includes('.')) {
        const filePath = args[0];
        if (!filePath.endsWith('.txt')) {
            console.error(
                'File must have .txt extension with language code, e.g., words.es.txt',
            );
            process.exit(1);
        }
        return { filePath };
    }

    if (args.length === 2) {
        const [word, languageCode] = args;
        if (word.includes('.') || !['en', 'es', 'ru'].includes(languageCode)) {
            console.error(
                'Invalid arguments. Use: add-word <word> <language_code> or add-word <file>',
            );
            console.error('Language codes: en, es, ru');
            process.exit(1);
        }
        return { word, languageCode };
    }

    showUsage();
    process.exit(1);
}

function showUsage() {
    console.log('Usage:');
    console.log(
        '  tsx scripts/add-word.ts <word> <language_code>    # Add single word',
    );
    console.log(
        '  tsx scripts/add-word.ts <file>                   # Add words from file',
    );
    console.log('');
    console.log('Examples:');
    console.log('  tsx scripts/add-word.ts hola es');
    console.log('  tsx scripts/add-word.ts words.es.txt');
    console.log('');
    console.log('File format: words.<language_code>.txt');
    console.log('Each line contains one word.');
}

async function readWordsFromFile(
    filePath: string,
): Promise<{ word: string; languageCode: string }[]> {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const fileName = path.basename(filePath);
        const match = fileName.match(/^(.+)\.([a-z]{2})\.txt$/);
        if (!match) {
            throw new Error(
                'File name must be in format: name.<language_code>.txt (e.g., words.es.txt)',
            );
        }

        const languageCode = match[2];
        if (!['en', 'es', 'ru'].includes(languageCode)) {
            throw new Error(
                `Unsupported language code: ${languageCode}. Supported: en, es, ru`,
            );
        }

        return lines.map(word => ({ word, languageCode }));
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(
                `Failed to read file ${filePath}: ${error.message}`,
            );
        }
        throw error;
    }
}

async function generateWordData(
    word: string,
    languageCode: string,
): Promise<WordData> {
    let prompt = '';
    try {
        prompt = await fs.readFile(promptTemplatePath, 'utf8');
    } catch (error) {
        throw new Error(`Failed to read prompt template: ${error}`);
    }

    const languageNames = { en: 'English', es: 'Spanish', ru: 'Russian' };
    const languageName =
        languageNames[languageCode as keyof typeof languageNames];

    prompt = prompt.replace(/\$\{word\}/g, word);
    prompt = prompt.replace(/\$\{language\}/g, languageName);
    prompt = prompt.replace(/\$\{languageCode\}/g, languageCode);

    const tempDir = path.join(__dirname, 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
    const promptFile = path.join(tempDir, `add-word-${word}-${timestamp}.txt`);
    await fs.writeFile(promptFile, prompt, 'utf8');

    return new Promise<WordData>((resolve, reject) => {
        const cursorCommand = `/Applications/Cursor.app/Contents/Resources/app/bin/cursor agent --print --output-format json --model ${DEFAULT_AI_MODEL}`;
        const cursorProcess = spawn(cursorCommand, {
            cwd: tempDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
            env: {
                ...process.env,
                CURSOR_MODEL: DEFAULT_AI_MODEL,
                MODEL: DEFAULT_AI_MODEL,
                AI_MODEL: DEFAULT_AI_MODEL,
            },
        });

        let stdout = '';
        let stderr = '';

        const timeout = setTimeout(() => {
            cursorProcess.kill('SIGTERM');
            reject(
                new Error(
                    `Cursor CLI timeout after 60 seconds for word "${word}"`,
                ),
            );
        }, 60000);

        cursorProcess.stdin.write(prompt);
        cursorProcess.stdin.end();

        cursorProcess.stdout.on('data', data => {
            stdout += data.toString();
        });
        cursorProcess.stderr.on('data', data => {
            stderr += data.toString();
        });

        cursorProcess.on('close', async code => {
            clearTimeout(timeout);
            try {
                await fs.unlink(promptFile);
            } catch {
                // best-effort cleanup
            }

            if (code !== 0) {
                reject(
                    new Error(
                        `Cursor CLI failed with exit code ${code}. Error: ${stderr}`,
                    ),
                );
                return;
            }

            try {
                const parsedResponse = JSON.parse(stdout);
                if (!parsedResponse.result) {
                    reject(
                        new Error(
                            `No result field in Cursor response. Full response: ${stdout.substring(0, 500)}`,
                        ),
                    );
                    return;
                }

                const resultText = parsedResponse.result;
                let cleanJson = '';

                // The agent may wrap JSON in a fenced block or emit it inline.
                const jsonBlockMatch = resultText.match(
                    /```json\s*(\{[\s\S]*?\})\s*```/,
                );
                if (jsonBlockMatch) {
                    cleanJson = jsonBlockMatch[1];
                } else {
                    const jsonStart = resultText.indexOf('{');
                    const jsonEnd = resultText.lastIndexOf('}');
                    if (
                        jsonStart !== -1 &&
                        jsonEnd !== -1 &&
                        jsonEnd > jsonStart
                    ) {
                        cleanJson = resultText.substring(
                            jsonStart,
                            jsonEnd + 1,
                        );
                    } else {
                        reject(
                            new Error(
                                `No JSON found in Cursor result. Result text: ${resultText.substring(0, 500)}`,
                            ),
                        );
                        return;
                    }
                }

                const wordData: WordData = JSON.parse(cleanJson);

                const generatedWord = wordData.word?.toLowerCase().trim();
                const requestedWord = word.toLowerCase().trim();

                if (!generatedWord) {
                    reject(
                        new Error(
                            `Generated data has no word field. Generated data: ${JSON.stringify(wordData).substring(0, 200)}`,
                        ),
                    );
                    return;
                }

                if (generatedWord !== requestedWord) {
                    reject(
                        new Error(
                            `Word mismatch: requested "${requestedWord}" but got "${generatedWord}".`,
                        ),
                    );
                    return;
                }

                if (wordData.languageCode !== languageCode) {
                    reject(
                        new Error(
                            `Language mismatch: requested "${languageCode}" but got "${wordData.languageCode}"`,
                        ),
                    );
                    return;
                }

                resolve(wordData);
            } catch (parseError) {
                reject(
                    new Error(
                        `Failed to parse Cursor CLI output: ${parseError}`,
                    ),
                );
            }
        });

        cursorProcess.on('error', error => {
            reject(new Error(`Failed to execute Cursor CLI: ${error.message}`));
        });
    });
}

async function importWordToDatabase(wordData: WordData): Promise<void> {
    const tempDir = path.join(__dirname, 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
    const jsonFile = path.join(
        tempDir,
        `import-${wordData.word}-${timestamp}.json`,
    );
    await fs.writeFile(jsonFile, JSON.stringify([wordData], null, 2), 'utf8');

    return new Promise<void>((resolve, reject) => {
        const importProcess = spawn(
            'tsx',
            [
                path.join(
                    __dirname,
                    '..',
                    'process-external-words',
                    'import-word-data.ts',
                ),
                jsonFile,
            ],
            {
                stdio: 'inherit',
                cwd: path.join(__dirname, '..', '..'),
            },
        );

        importProcess.on('close', async code => {
            try {
                await fs.unlink(jsonFile);
            } catch {
                // best-effort cleanup
            }

            if (code === 0) {
                resolve();
            } else {
                reject(
                    new Error(`Import script failed with exit code ${code}`),
                );
            }
        });

        importProcess.on('error', error => {
            reject(
                new Error(`Failed to execute import script: ${error.message}`),
            );
        });
    });
}

async function main() {
    try {
        const args = parseArgs();
        let words: { word: string; languageCode: string }[] = [];

        if (args.word && args.languageCode) {
            words = [{ word: args.word, languageCode: args.languageCode }];
        } else if (args.filePath) {
            words = await readWordsFromFile(args.filePath);
            console.log(`Read ${words.length} words from ${args.filePath}`);
        }

        let succeeded = 0;
        for (const { word, languageCode } of words) {
            try {
                const wordData = await generateWordData(word, languageCode);
                await importWordToDatabase(wordData);
                console.log(`Added: ${word}`);
                succeeded++;
            } catch (error) {
                console.error(
                    `Failed to process "${word}":`,
                    error instanceof Error ? error.message : error,
                );
            }
        }

        console.log(`Done: ${succeeded}/${words.length} words added.`);
    } catch (error) {
        console.error(
            'Script failed:',
            error instanceof Error ? error.message : error,
        );
        process.exit(1);
    }
}

main();
