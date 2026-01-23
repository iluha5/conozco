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
} from './generate-word-migration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default AI model (will be loaded in main function)
let DEFAULT_AI_MODEL = 'grok-code-fast-1';

interface GenerateWordDataOptions {
    word: string;
    languageCode: string;
    exportOnly?: boolean;
}

/**
 * Generate WordData for a single word using existing scripts
 */
async function generateWordData(
    word: string,
    languageCode: string,
): Promise<WordData> {
    console.log(`🎯 Generating data for word: "${word}" (${languageCode})`);

    // Determine which script to use
    const scriptPath =
        languageCode === 'en'
            ? path.join(__dirname, 'add-english-word', 'add-english-word.ts')
            : path.join(__dirname, 'add-word', 'add-word.ts');

    // Read prompt template based on language
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
    const promptFile = path.join(
        tempDir,
        `generate-word-${word}-${timestamp}.txt`,
    );
    await fs.writeFile(promptFile, prompt, 'utf8');

    // Execute Cursor CLI
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
                const parsedResponse = JSON.parse(stdout);

                if (parsedResponse.result) {
                    const resultText = parsedResponse.result;

                    let cleanJson = '';

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
                                `Word mismatch: requested "${requestedWord}" but got "${generatedWord}". The AI returned data for a different word.`,
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

/**
 * Read words from file
 */
async function readWordsFromFile(
    filePath: string,
): Promise<{ word: string; languageCode: string }[]> {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const lines = content
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        // Extract language code from filename (e.g., words.es.txt -> es, new_words.en.txt -> en)
        const fileName = path.basename(filePath);
        const match = fileName.match(/^(.+)\.([a-z]{2})\.txt$/);
        if (!match) {
            throw new Error(
                'File name must be in format: name.<language_code>.txt (e.g., words.es.txt, new_words.en.txt)',
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

/**
 * Check if word exists in database
 */
async function checkWordExists(
    word: string,
    languageCode: string,
): Promise<boolean> {
    // For now, we'll skip database check and generate migration for all words
    // This can be enhanced later to check against actual database
    return false;
}

async function main() {
    // Ensure config is loaded
    try {
        const config = await import('./cursor/config.mjs');
        DEFAULT_AI_MODEL = config.DEFAULT_AI_MODEL || 'grok-code-fast-1';
    } catch (e) {
        // Use default
    }

    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage:');
        console.log(
            '  tsx scripts/generate-word-migration-pipeline.ts <file> [--check-only]',
        );
        console.log('');
        console.log('Examples:');
        console.log(
            '  tsx scripts/generate-word-migration-pipeline.ts new_words.en.txt',
        );
        console.log(
            '  tsx scripts/generate-word-migration-pipeline.ts spanish_verbs.es.txt --check-only',
        );
        process.exit(1);
    }

    const filePath = args[0];
    const checkOnly = args.includes('--check-only');

    try {
        console.log(`📖 Reading words from: ${filePath}`);

        // Read words from file
        const words = await readWordsFromFile(filePath);
        const languageCode = words[0]?.languageCode || 'en';

        console.log(`🌐 Detected language: ${languageCode}`);
        console.log(`📊 Found ${words.length} words to process`);

        if (checkOnly) {
            console.log('\n🔍 Checking existing words in database...');
            // TODO: Implement database check
            console.log('⚠️  Database check not implemented yet');
            return;
        }

        // Extract migration name from filename (e.g., new_words.en.txt -> new_words)
        const fileName = path.basename(filePath);
        const match = fileName.match(/^(.+)\.([a-z]{2})\.txt$/);
        const migrationName = match ? match[1] : 'migration';

        console.log('\n🎯 Generating word data...');

        const wordDataArray: WordData[] = [];
        const failedWords: string[] = [];

        // Generate WordData for each word
        for (let i = 0; i < words.length; i++) {
            const { word } = words[i];
            try {
                console.log(
                    `  [${i + 1}/${words.length}] Processing: "${word}"`,
                );
                const wordData = await generateWordData(word, languageCode);
                wordDataArray.push(wordData);
                console.log(`  ✅ ${word} - generated`);
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                console.error(`  ❌ ${word} - failed: ${errorMessage}`);
                failedWords.push(word);
            }
        }

        if (wordDataArray.length === 0) {
            console.error('❌ No words were successfully generated');
            process.exit(1);
        }

        if (failedWords.length > 0) {
            console.log(
                `\n⚠️  Failed to generate ${failedWords.length} words:`,
            );
            failedWords.forEach(word => console.log(`   - ${word}`));
        }

        console.log(
            `\n📝 Generating migration for ${wordDataArray.length} words...`,
        );

        // Generate timestamp for migration
        const timestamp = new Date()
            .toISOString()
            .replace(/[-:T]/g, '')
            .slice(0, 14); // YYYYMMDDHHMMSS

        const metadata = {
            name: migrationName,
            description: `Data migration for ${wordDataArray.length} words`,
            timestamp,
            wordsCount: wordDataArray.length,
            language: languageCode,
        };

        // Generate migration SQL
        const migrationSQL = generateMigrationSQL(wordDataArray, metadata);
        const rollbackSQL = generateRollbackSQL(wordDataArray, metadata);
        const checksum = calculateChecksum(migrationSQL);

        // Create migration directory
        const migrationDir = path.join(
            __dirname,
            '..',
            'prisma',
            'data-migrations',
            `${timestamp}_${migrationName}`,
        );
        await fs.mkdir(migrationDir, { recursive: true });

        // Write migration files
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

        // Write metadata file
        const metadataContent = {
            ...metadata,
            checksum,
            generatedAt: new Date().toISOString(),
        };
        await fs.writeFile(
            path.join(migrationDir, 'metadata.json'),
            JSON.stringify(metadataContent, null, 2),
            'utf8',
        );

        console.log(
            `✅ Migration created: prisma/data-migrations/${timestamp}_${migrationName}/`,
        );
        console.log(`   - migration.sql (${wordDataArray.length} words)`);
        console.log(`   - rollback.sql`);
        console.log(`   - metadata.json`);
        console.log(`   - Checksum: ${checksum}`);
        console.log('\n📝 Next steps:');
        console.log(
            `   1. Review the migration: cat ${migrationDir}/migration.sql`,
        );
        console.log(
            `   2. Add to git: git add prisma/data-migrations/${timestamp}_${migrationName}/`,
        );
        console.log(
            `   3. Commit: git commit -m "Add data migration: ${migrationName} (${languageCode})"`,
        );
        console.log(`   4. Push: git push origin main`);
    } catch (error) {
        console.error(
            '❌ Script failed:',
            error instanceof Error ? error.message : error,
        );
        process.exit(1);
    }
}

main();
