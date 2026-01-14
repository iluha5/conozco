#!/usr/bin/env tsx

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_AI_MODEL } from '../cursor/config.mjs';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const promptTemplatePath = path.join(
    __dirname,
    '..',
    'cursor',
    'prompts',
    'process-external-words-english.txt',
);

interface AddEnglishWordArgs {
    word?: string;
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

function parseArgs(): AddEnglishWordArgs {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        showUsage();
        process.exit(1);
    }

    // Check if it's a file path
    if (args.length === 1 && args[0].includes('.')) {
        const filePath = args[0];
        if (!filePath.endsWith('.txt')) {
            console.error(
                'File must have .txt extension, e.g., words.txt or words.en.txt',
            );
            process.exit(1);
        }
        return { filePath };
    }

    // Check if it's a single word
    if (args.length === 1) {
        return { word: args[0] };
    }

    showUsage();
    process.exit(1);
}

function showUsage() {
    console.log('Usage:');
    console.log(
        '  tsx scripts/add-english-word.ts <word>              # Add/update single English word',
    );
    console.log(
        '  tsx scripts/add-english-word.ts <file>             # Add/update words from file',
    );
    console.log('');
    console.log('Examples:');
    console.log('  tsx scripts/add-english-word.ts hello');
    console.log('  tsx scripts/add-english-word.ts words.txt');
    console.log('  tsx scripts/add-english-word.ts words.en.txt');
    console.log('');
    console.log('File format: words.txt or words.en.txt');
    console.log('Each line contains one English word.');
    console.log('');
    console.log('Note: This script generates Russian and Spanish translations.');
    console.log('If word exists in DB, translations will be updated.');
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

        // All words are English
        const languageCode = 'en';

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
    console.log(`🎯 Generating data for word: "${word}" (${languageCode})`);

    // Read prompt template
    let prompt = '';
    try {
        prompt = await fs.readFile(promptTemplatePath, 'utf8');
    } catch (error) {
        throw new Error(`Failed to read prompt template: ${error}`);
    }

    // Get language name from code
    const languageNames = {
        en: 'English',
        es: 'Spanish',
        ru: 'Russian',
    };
    const languageName =
        languageNames[languageCode as keyof typeof languageNames];

    // Replace placeholders in prompt
    prompt = prompt.replace(/\$\{word\}/g, word);
    prompt = prompt.replace(/\$\{language\}/g, languageName);
    prompt = prompt.replace(/\$\{languageCode\}/g, languageCode);

    // Create temporary prompt file
    const tempDir = path.join(__dirname, 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
    const promptFile = path.join(tempDir, `add-english-word-${word}-${timestamp}.txt`);
    await fs.writeFile(promptFile, prompt, 'utf8');

    console.log(`📝 Created prompt file: ${promptFile}`);
    console.log(`🤖 Using AI model: ${DEFAULT_AI_MODEL}`);

    // Execute Cursor CLI directly (like execute-cursor-prompt.ts)
    return new Promise<WordData>((resolve, reject) => {
        const cursorCommand = `/Applications/Cursor.app/Contents/Resources/app/bin/cursor agent --print --output-format json --model ${DEFAULT_AI_MODEL}`;
        const cursorProcess = spawn(cursorCommand, {
            cwd: tempDir,
            stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
            shell: true,
            env: {
                ...process.env,
                // Force specific AI model for consistent results and cost control
                CURSOR_MODEL: DEFAULT_AI_MODEL,
                MODEL: DEFAULT_AI_MODEL,
                AI_MODEL: DEFAULT_AI_MODEL,
            },
        });

        let stdout = '';
        let stderr = '';

        // Timeout in case Cursor hangs
        const timeout = setTimeout(() => {
            cursorProcess.kill('SIGTERM');
            reject(
                new Error(
                    `Cursor CLI timeout after 60 seconds for word "${word}"`,
                ),
            );
        }, 60000); // 60 seconds

        // Send prompt to stdin
        cursorProcess.stdin.write(prompt);
        cursorProcess.stdin.end();

        // Collect output
        cursorProcess.stdout.on('data', data => {
            stdout += data.toString();
        });

        cursorProcess.stderr.on('data', data => {
            stderr += data.toString();
        });

        cursorProcess.on('close', async code => {
            clearTimeout(timeout);
            // Clean up prompt file
            try {
                await fs.unlink(promptFile);
            } catch (e) {
                // Ignore cleanup errors
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
                // Parse result from Cursor agent (improved version like in execute-cursor-prompt.ts)
                const parsedResponse = JSON.parse(stdout);

                if (parsedResponse.result) {
                    // Extract JSON from result field
                    const resultText = parsedResponse.result;

                    let cleanJson = '';

                    // First try to find ```json block
                    const jsonBlockMatch = resultText.match(
                        /```json\s*(\{[\s\S]*?\})\s*```/,
                    );
                    if (jsonBlockMatch) {
                        cleanJson = jsonBlockMatch[1];
                    } else {
                        // If JSON block not found, try to find JSON itself
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

                    // Validation: check word match
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
                                `Word mismatch: requested "${requestedWord}" but got "${generatedWord}". The AI returned data for a different word.`,
                            ),
                        );
                        return;
                    }

                    // Check language match (should always be 'en' for this script)
                    if (wordData.languageCode !== languageCode) {
                        reject(
                            new Error(
                                `Language mismatch: requested "${languageCode}" but got "${wordData.languageCode}"`,
                            ),
                        );
                        return;
                    }

                    console.log(`✅ Successfully generated data for "${word}"`);
                    resolve(wordData);
                } else {
                    reject(
                        new Error(
                            `No result field in Cursor response. Full response: ${stdout.substring(0, 500)}`,
                        ),
                    );
                }
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
    console.log(`💾 Importing "${wordData.word}" to database...`);

    // Create temporary JSON file for import
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

    // Execute import script
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
                cwd: path.join(__dirname, '..', '..'), // Project root
            },
        );

        importProcess.on('close', async code => {
            // Clean up JSON file
            try {
                await fs.unlink(jsonFile);
            } catch (e) {
                // Ignore cleanup errors
            }

            if (code === 0) {
                console.log(
                    `✅ Successfully imported "${wordData.word}" to database`,
                );
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

        if (args.word) {
            // Single word mode - always English
            words = [{ word: args.word, languageCode: 'en' }];
        } else if (args.filePath) {
            // File mode - all words are English
            words = await readWordsFromFile(args.filePath);
            console.log(`📖 Read ${words.length} words from ${args.filePath}`);
        }

        // Progress tracking
        let processedCount = 0;
        let successCount = 0;
        let failedCount = 0;
        const successfulWords: string[] = [];
        const failedWords: string[] = [];
        const startTime = Date.now();

        // Create progress log file
        const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-')
            .slice(0, -5);
        const progressLogPath = path.join(__dirname, 'temp', `progress-${timestamp}.txt`);
        await fs.mkdir(path.dirname(progressLogPath), { recursive: true });

        console.log(`📊 Starting batch processing of ${words.length} words...`);
        console.log(`📝 Progress will be saved to: ${progressLogPath}`);

        // Process each word
        for (const { word, languageCode } of words) {
            processedCount++;
            const progress = Math.round((processedCount / words.length) * 100);
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            const eta = processedCount > 0 ? Math.round((elapsed / processedCount) * (words.length - processedCount)) : 0;

            try {
                console.log(`\n🚀 [${processedCount}/${words.length}] Processing: "${word}" (${progress}%, ETA: ${eta}s)`);
                const wordData = await generateWordData(word, languageCode);
                await importWordToDatabase(wordData);
                successCount++;
                successfulWords.push(word);
                console.log(`✅ Successfully processed: "${word}" (${successCount}/${processedCount})`);
            } catch (error) {
                failedCount++;
                failedWords.push(word);
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`❌ Failed to process "${word}": ${errorMessage} (${failedCount} failed)`);
                // Continue with next word
            }

            // Save progress to file every 10 words
            if (processedCount % 10 === 0 || processedCount === words.length) {
                const progressContent = `
=== ENGLISH WORDS PROCESSING PROGRESS ===
Started: ${new Date(startTime).toISOString()}
Current: ${new Date().toISOString()}
Elapsed: ${elapsed}s
Progress: ${processedCount}/${words.length} (${progress}%)

SUCCESSFUL (${successCount}):
${successfulWords.map(w => `✅ ${w}`).join('\n')}

FAILED (${failedCount}):
${failedWords.map(w => `❌ ${w}`).join('\n')}

SUMMARY:
- Total: ${words.length}
- Processed: ${processedCount}
- Successful: ${successCount}
- Failed: ${failedCount}
- Success Rate: ${processedCount > 0 ? Math.round((successCount / processedCount) * 100) : 0}%

${processedCount < words.length ? `Next: Processing continues...` : `FINISHED: All words processed!`}
`;
                await fs.writeFile(progressLogPath, progressContent.trim());
            }
        }

        const totalTime = Math.round((Date.now() - startTime) / 1000);
        const successRate = words.length > 0 ? Math.round((successCount / words.length) * 100) : 0;

        console.log(`\n🎉 Batch processing completed!`);
        console.log(`📊 Final Results:`);
        console.log(`   - Total words: ${words.length}`);
        console.log(`   - Successful: ${successCount}`);
        console.log(`   - Failed: ${failedCount}`);
        console.log(`   - Success rate: ${successRate}%`);
        console.log(`   - Total time: ${totalTime}s`);
        console.log(`📝 Progress log saved to: ${progressLogPath}`);

        if (failedWords.length > 0) {
            console.log(`\n⚠️ Failed words (${failedWords.length}):`);
            failedWords.forEach(word => console.log(`   - ${word}`));
        }

    } catch (error) {
        console.error(
            '❌ Script failed:',
            error instanceof Error ? error.message : error,
        );
        process.exit(1);
    }
}

main();
