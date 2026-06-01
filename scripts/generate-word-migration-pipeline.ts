#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import {
    generateMigrationSQL,
    generateRollbackSQL,
    calculateChecksum,
    WordData,
} from './generate-word-migration.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURSOR_AGENT_BIN =
    '/Applications/Cursor.app/Contents/Resources/app/bin/cursor agent';

let DEFAULT_AI_MODEL = 'composer-2.5';
let FALLBACK_AI_MODEL = 'gpt-5-mini';

function parseWordDataFromCursorOutput(
    stdout: string,
    word: string,
    languageCode: string,
): WordData {
    const parsedResponse = JSON.parse(stdout);
    if (!parsedResponse.result) {
        throw new Error(
            `No result field in Cursor response. Full response: ${stdout.substring(0, 500)}`,
        );
    }

    const resultText = parsedResponse.result;
    let cleanJson = '';

    const jsonBlockMatch = resultText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
    if (jsonBlockMatch) {
        cleanJson = jsonBlockMatch[1];
    } else {
        const jsonStart = resultText.indexOf('{');
        const jsonEnd = resultText.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanJson = resultText.substring(jsonStart, jsonEnd + 1);
        } else {
            throw new Error(
                `No JSON found in Cursor result. Result text: ${resultText.substring(0, 500)}`,
            );
        }
    }

    const wordData: WordData = JSON.parse(cleanJson);
    const generatedWord = wordData.word?.toLowerCase().trim();
    const requestedWord = word.toLowerCase().trim();

    if (!generatedWord) {
        throw new Error(
            `Generated data has no word field. Generated data: ${JSON.stringify(wordData).substring(0, 200)}`,
        );
    }

    if (generatedWord !== requestedWord) {
        throw new Error(
            `Word mismatch: requested "${requestedWord}" but got "${generatedWord}".`,
        );
    }

    if (wordData.languageCode !== languageCode) {
        throw new Error(
            `Language mismatch: requested "${languageCode}" but got "${wordData.languageCode}"`,
        );
    }

    return wordData;
}

async function generateWordDataWithModel(
    word: string,
    languageCode: string,
    modelSlug: string,
): Promise<WordData> {
    const promptTemplatePath =
        languageCode === 'en'
            ? path.join(
                  __dirname,
                  'cursor',
                  'prompts',
                  'process-external-words-english.txt',
              )
            : path.join(
                  __dirname,
                  'cursor',
                  'prompts',
                  'process-external-words-simple.txt',
              );

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
    const promptFile = path.join(
        tempDir,
        `generate-word-${word}-${timestamp}.txt`,
    );
    await fs.writeFile(promptFile, prompt, 'utf8');

    return new Promise<WordData>((resolve, reject) => {
        const cursorCommand = `${CURSOR_AGENT_BIN} --print --output-format json --model ${modelSlug}`;
        const cursorProcess = spawn(cursorCommand, {
            cwd: tempDir,
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true,
            env: {
                ...process.env,
                CURSOR_MODEL: modelSlug,
                MODEL: modelSlug,
                AI_MODEL: modelSlug,
            },
        });

        let stdout = '';
        let stderr = '';

        const timeout = setTimeout(() => {
            cursorProcess.kill('SIGTERM');
            reject(
                new Error(
                    `Cursor CLI timeout after 60 seconds for word "${word}" (model=${modelSlug})`,
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
                        `Cursor CLI failed (model=${modelSlug}, exit=${code}): ${stderr}`,
                    ),
                );
                return;
            }

            try {
                resolve(
                    parseWordDataFromCursorOutput(stdout, word, languageCode),
                );
            } catch (parseError) {
                reject(
                    new Error(
                        `Failed to parse Cursor CLI output (model=${modelSlug}): ${parseError}`,
                    ),
                );
            }
        });

        cursorProcess.on('error', error => {
            reject(
                new Error(
                    `Failed to execute Cursor CLI (model=${modelSlug}): ${error.message}`,
                ),
            );
        });
    });
}

async function generateWordData(
    word: string,
    languageCode: string,
): Promise<{ wordData: WordData; modelUsed: string }> {
    try {
        const wordData = await generateWordDataWithModel(
            word,
            languageCode,
            DEFAULT_AI_MODEL,
        );
        return { wordData, modelUsed: DEFAULT_AI_MODEL };
    } catch (primaryError) {
        if (FALLBACK_AI_MODEL === DEFAULT_AI_MODEL) {
            throw primaryError;
        }

        const primaryMessage =
            primaryError instanceof Error
                ? primaryError.message
                : String(primaryError);
        console.warn(
            `Retrying "${word}" with fallback model ${FALLBACK_AI_MODEL} (${primaryMessage})`,
        );

        const wordData = await generateWordDataWithModel(
            word,
            languageCode,
            FALLBACK_AI_MODEL,
        );
        return { wordData, modelUsed: FALLBACK_AI_MODEL };
    }
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

async function main() {
    try {
        const config = await import('./cursor/config.mjs');
        DEFAULT_AI_MODEL = config.DEFAULT_AI_MODEL || 'composer-2.5';
        FALLBACK_AI_MODEL = config.FALLBACK_AI_MODEL || 'gpt-5-mini';
    } catch {
        // fall back to defaults above
    }

    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(
            'Usage: tsx scripts/generate-word-migration-pipeline.ts <file> [--check-only]\n' +
                '  e.g. new_words.en.txt or spanish_verbs.es.txt',
        );
        process.exit(1);
    }

    const filePath = args[0];
    const checkOnly = args.includes('--check-only');

    try {
        const words = await readWordsFromFile(filePath);
        const languageCode = words[0]?.languageCode || 'en';
        console.log(
            `Loaded ${words.length} ${languageCode} words. ` +
                `Models: primary=${DEFAULT_AI_MODEL}, fallback=${FALLBACK_AI_MODEL}`,
        );

        if (checkOnly) {
            console.log('--check-only is not implemented yet.');
            return;
        }

        const fileName = path.basename(filePath);
        const match = fileName.match(/^(.+)\.([a-z]{2})\.txt$/);
        const migrationName = match ? match[1] : 'migration';

        const wordDataArray: WordData[] = [];
        const failedWords: string[] = [];

        for (let i = 0; i < words.length; i++) {
            const { word } = words[i];
            try {
                const { wordData, modelUsed } = await generateWordData(
                    word,
                    languageCode,
                );
                wordDataArray.push(wordData);
                console.log(
                    `[${i + 1}/${words.length}] OK: ${word} [${modelUsed}]`,
                );
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    `[${i + 1}/${words.length}] FAIL: ${word} — ${message}`,
                );
                failedWords.push(word);
            }
        }

        if (wordDataArray.length === 0) {
            console.error('No words were successfully generated.');
            process.exit(1);
        }

        const timestamp = new Date()
            .toISOString()
            .replace(/[-:T]/g, '')
            .slice(0, 14);

        const metadata = {
            name: migrationName,
            description: `Data migration for ${wordDataArray.length} words`,
            timestamp,
            wordsCount: wordDataArray.length,
            language: languageCode,
        };

        const migrationSQL = generateMigrationSQL(wordDataArray, metadata);
        const rollbackSQL = generateRollbackSQL(wordDataArray, metadata);
        const checksum = calculateChecksum(migrationSQL);

        const migrationDir = path.join(
            __dirname,
            '..',
            'prisma',
            'data-migrations',
            `${timestamp}_${migrationName}`,
        );
        await fs.mkdir(migrationDir, { recursive: true });

        await fs.writeFile(
            path.join(migrationDir, 'migration.sql'),
            migrationSQL,
            'utf8',
        );
        await fs.writeFile(
            path.join(migrationDir, 'rollback.sql'),
            rollbackSQL,
            'utf8',
        );
        await fs.writeFile(
            path.join(migrationDir, 'metadata.json'),
            JSON.stringify(
                {
                    ...metadata,
                    checksum,
                    generatedAt: new Date().toISOString(),
                },
                null,
                2,
            ),
            'utf8',
        );

        console.log(
            `Migration created: prisma/data-migrations/${timestamp}_${migrationName}/ ` +
                `(${wordDataArray.length} words, checksum=${checksum})`,
        );

        if (failedWords.length > 0) {
            console.log(`Skipped ${failedWords.length} failed words:`);
            failedWords.forEach(word => console.log(`  ${word}`));
        }
    } catch (error) {
        console.error(
            'Script failed:',
            error instanceof Error ? error.message : error,
        );
        process.exit(1);
    }
}

main();
