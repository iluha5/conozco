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
import { loadMigrationEnv } from './migration-pipeline/load-env';
import {
    ensureSshTunnel,
    runTunnelOnly,
    type SshTunnelHandle,
} from './migration-pipeline/ssh-tunnel';
import {
    buildMigrationNameFromProd,
    fetchWordsFromProd,
    validateLanguageCode,
    validateSourceFilter,
    writeWordsToFile,
    type SupportedLanguage,
} from './migration-pipeline/fetch-words-from-prod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURSOR_BIN = '/Applications/Cursor.app/Contents/Resources/app/bin/cursor';

const CHECKPOINTS_ROOT = path.join(__dirname, 'temp', 'migration-pipelines');

let DEFAULT_AI_MODEL = 'composer-2.5';
let FALLBACK_AI_MODEL = 'gpt-5-mini';

type CheckpointStatus = 'in_progress' | 'completed' | 'interrupted';

interface PipelineCheckpoint {
    sourceFile: string;
    sourceFileMtimeMs: number;
    migrationName: string;
    languageCode: string;
    migrationTimestamp: string;
    status: CheckpointStatus;
    completedWords: string[];
    failedWords: string[];
    wordData: WordData[];
    totalRequested: number;
}

interface MigrationArtifactMetadata {
    name: string;
    description: string;
    timestamp: string;
    wordsCount: number;
    language: string;
    status: 'complete' | 'partial';
    totalRequested: number;
}

interface PipelineSession {
    sourceFile: string;
    sourceFileMtimeMs: number;
    migrationName: string;
    languageCode: string;
    migrationTimestamp: string;
    totalRequested: number;
    wordDataArray: WordData[];
    completedWords: string[];
    failedWords: string[];
    checkpointDir: string;
}

let activeSession: PipelineSession | null = null;
let shuttingDown = false;
let activeTunnel: SshTunnelHandle | null = null;

function getFlagValue(argv: string[], flag: string): string | undefined {
    const index = argv.indexOf(flag);
    if (index === -1) {
        return undefined;
    }
    return argv[index + 1];
}

function hasFlag(argv: string[], flag: string): boolean {
    return argv.includes(flag);
}

function getCursorAgentEnv(): NodeJS.ProcessEnv {
    const env = { ...process.env };
    delete env.CURSOR_API_KEY;
    return env;
}

function runCursorCommand(
    args: string[],
    options: {
        cwd?: string;
        stdio: 'inherit' | ['pipe', 'pipe', 'pipe'];
        extraEnv?: Record<string, string>;
    },
): ReturnType<typeof spawn> {
    return spawn(CURSOR_BIN, ['agent', ...args], {
        cwd: options.cwd,
        stdio: options.stdio,
        env: {
            ...getCursorAgentEnv(),
            ...options.extraEnv,
        },
    });
}

function runCursorCommandAndWait(
    args: string[],
    options: { ignoreFailure?: boolean } = {},
): Promise<void> {
    return new Promise((resolve, reject) => {
        const childProcess = runCursorCommand(args, {
            stdio: 'inherit',
        });

        const handleClose = (code: number | null) => {
            if (code === 0 || options.ignoreFailure) {
                resolve();
                return;
            }

            reject(
                new Error(
                    `Cursor CLI ${args.join(' ')} failed (exit=${code}).`,
                ),
            );
        };

        const handleError = (error: Error) => {
            if (options.ignoreFailure) {
                resolve();
                return;
            }

            reject(
                new Error(
                    `Failed to start Cursor CLI ${args.join(' ')}: ${error.message}`,
                ),
            );
        };

        childProcess.on('close', handleClose);
        childProcess.on('error', handleError);
    });
}

async function ensureCursorCliLogin(): Promise<void> {
    delete process.env.CURSOR_API_KEY;

    console.log('Opening Cursor CLI browser login (API keys are not used)...');

    await runCursorCommandAndWait(['logout'], { ignoreFailure: true });

    try {
        await runCursorCommandAndWait(['login']);
    } catch {
        throw new Error(
            'Cursor CLI login failed. Complete the browser login and retry.',
        );
    }
}

async function closeActiveTunnel(): Promise<void> {
    if (!activeTunnel) {
        return;
    }
    await activeTunnel.close();
    activeTunnel = null;
}

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

function createMigrationTimestamp(): string {
    return new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
}

function getCheckpointDir(migrationName: string): string {
    return path.join(CHECKPOINTS_ROOT, migrationName);
}

function getCheckpointPath(migrationName: string): string {
    return path.join(getCheckpointDir(migrationName), 'checkpoint.json');
}

async function getSourceFileMtimeMs(sourceFile: string): Promise<number> {
    const stats = await fs.stat(sourceFile);
    return stats.mtimeMs;
}

async function saveCheckpoint(
    session: PipelineSession,
    status: CheckpointStatus,
): Promise<void> {
    await fs.mkdir(session.checkpointDir, { recursive: true });

    const checkpoint: PipelineCheckpoint = {
        sourceFile: session.sourceFile,
        sourceFileMtimeMs: session.sourceFileMtimeMs,
        migrationName: session.migrationName,
        languageCode: session.languageCode,
        migrationTimestamp: session.migrationTimestamp,
        status,
        completedWords: session.completedWords,
        failedWords: session.failedWords,
        wordData: session.wordDataArray,
        totalRequested: session.totalRequested,
    };

    const checkpointPath = path.join(session.checkpointDir, 'checkpoint.json');
    const tempPath = `${checkpointPath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(checkpoint, null, 2), 'utf8');
    await fs.rename(tempPath, checkpointPath);
}

async function loadCheckpoint(
    migrationName: string,
): Promise<PipelineCheckpoint | null> {
    const checkpointPath = getCheckpointPath(migrationName);
    try {
        const content = await fs.readFile(checkpointPath, 'utf8');
        return JSON.parse(content) as PipelineCheckpoint;
    } catch (error) {
        if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 'ENOENT'
        ) {
            return null;
        }
        throw error;
    }
}

function checkpointMatchesSource(
    checkpoint: PipelineCheckpoint,
    sourceFile: string,
    sourceFileMtimeMs: number,
): boolean {
    return (
        checkpoint.sourceFile === path.resolve(sourceFile) &&
        checkpoint.sourceFileMtimeMs === sourceFileMtimeMs
    );
}

async function writeMigrationArtifacts(
    wordDataArray: WordData[],
    metadata: MigrationArtifactMetadata,
): Promise<string> {
    const migrationSQL = generateMigrationSQL(wordDataArray, metadata);
    const rollbackSQL = generateRollbackSQL(wordDataArray, metadata);
    const checksum = calculateChecksum(migrationSQL);

    const migrationDir = path.join(
        __dirname,
        '..',
        'prisma',
        'data-migrations',
        `${metadata.timestamp}_${metadata.name}`,
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

    return migrationDir;
}

function buildMigrationMetadata(
    session: PipelineSession,
    status: 'complete' | 'partial',
): MigrationArtifactMetadata {
    return {
        name: session.migrationName,
        description: `Data migration for ${session.wordDataArray.length} words`,
        timestamp: session.migrationTimestamp,
        wordsCount: session.wordDataArray.length,
        language: session.languageCode,
        status,
        totalRequested: session.totalRequested,
    };
}

async function finalizeSession(
    session: PipelineSession,
    status: 'complete' | 'partial',
): Promise<string> {
    if (session.wordDataArray.length === 0) {
        throw new Error('No words available to finalize migration.');
    }

    const migrationDir = await writeMigrationArtifacts(
        session.wordDataArray,
        buildMigrationMetadata(session, status),
    );

    const checkpointStatus: CheckpointStatus =
        status === 'complete' ? 'completed' : 'interrupted';
    await saveCheckpoint(session, checkpointStatus);

    return migrationDir;
}

async function handleShutdownSignal(signal: string): Promise<void> {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;

    console.log(`\nReceived ${signal}, saving progress...`);

    const session = activeSession;
    if (!session || session.wordDataArray.length === 0) {
        console.log('No generated words to save.');
        process.exit(signal === 'SIGINT' ? 130 : 143);
        return;
    }

    try {
        const migrationDir = await finalizeSession(session, 'partial');
        const relativeDir = path.relative(
            path.join(__dirname, '..'),
            migrationDir,
        );
        console.log(
            `Partial migration saved: ${relativeDir} ` +
                `(${session.wordDataArray.length}/${session.totalRequested} words)`,
        );
    } catch (error) {
        console.error(
            'Failed to save partial migration:',
            error instanceof Error ? error.message : error,
        );
        process.exit(1);
        return;
    }

    process.exit(signal === 'SIGINT' ? 130 : 143);
}

function registerShutdownHandlers(): void {
    process.on('SIGINT', () => {
        void handleShutdownSignal('SIGINT');
    });
    process.on('SIGTERM', () => {
        void handleShutdownSignal('SIGTERM');
    });
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
        const cursorProcess = runCursorCommand(
            ['--print', '--output-format', 'json', '--model', modelSlug],
            {
                cwd: tempDir,
                stdio: ['pipe', 'pipe', 'pipe'],
                extraEnv: {
                    CURSOR_MODEL: modelSlug,
                    MODEL: modelSlug,
                    AI_MODEL: modelSlug,
                },
            },
        );

        let stdout = '';
        let stderr = '';

        const stdinPipe = cursorProcess.stdin;
        const stdoutPipe = cursorProcess.stdout;
        const stderrPipe = cursorProcess.stderr;

        if (!stdinPipe || !stdoutPipe || !stderrPipe) {
            reject(new Error('Cursor CLI process is missing stdio pipes'));
            return;
        }

        const timeout = setTimeout(() => {
            cursorProcess.kill('SIGTERM');
            reject(
                new Error(
                    `Cursor CLI timeout after 60 seconds for word "${word}" (model=${modelSlug})`,
                ),
            );
        }, 60000);

        stdinPipe.write(prompt);
        stdinPipe.end();

        stdoutPipe.on('data', data => {
            stdout += data.toString();
        });

        stderrPipe.on('data', data => {
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

function isWordCompleted(session: PipelineSession, word: string): boolean {
    const normalizedWord = word.toLowerCase().trim();
    return session.completedWords.some(
        completedWord => completedWord.toLowerCase().trim() === normalizedWord,
    );
}

async function initializeSession(
    sourceFile: string,
    migrationName: string,
    languageCode: string,
    totalRequested: number,
    forceRestart: boolean,
): Promise<PipelineSession> {
    const resolvedSourceFile = path.resolve(sourceFile);
    const sourceFileMtimeMs = await getSourceFileMtimeMs(resolvedSourceFile);
    const checkpointDir = getCheckpointDir(migrationName);

    if (!forceRestart) {
        const checkpoint = await loadCheckpoint(migrationName);
        if (
            checkpoint &&
            checkpointMatchesSource(
                checkpoint,
                resolvedSourceFile,
                sourceFileMtimeMs,
            ) &&
            checkpoint.status !== 'completed'
        ) {
            console.log(
                `Resuming checkpoint: ${checkpoint.completedWords.length}/${totalRequested} words already done.`,
            );
            return {
                sourceFile: resolvedSourceFile,
                sourceFileMtimeMs,
                migrationName,
                languageCode,
                migrationTimestamp: checkpoint.migrationTimestamp,
                totalRequested,
                wordDataArray: checkpoint.wordData,
                completedWords: checkpoint.completedWords,
                failedWords: checkpoint.failedWords,
                checkpointDir,
            };
        }
    }

    const session: PipelineSession = {
        sourceFile: resolvedSourceFile,
        sourceFileMtimeMs,
        migrationName,
        languageCode,
        migrationTimestamp: createMigrationTimestamp(),
        totalRequested,
        wordDataArray: [],
        completedWords: [],
        failedWords: [],
        checkpointDir,
    };

    await saveCheckpoint(session, 'in_progress');
    return session;
}

async function runGenerationLoop(session: PipelineSession): Promise<void> {
    const words = await readWordsFromFile(session.sourceFile);

    for (let index = 0; index < words.length; index++) {
        if (shuttingDown) {
            return;
        }

        const { word } = words[index];

        if (isWordCompleted(session, word)) {
            console.log(
                `[${index + 1}/${words.length}] SKIP: ${word} (checkpoint)`,
            );
            continue;
        }

        try {
            const { wordData, modelUsed } = await generateWordData(
                word,
                session.languageCode,
            );
            session.wordDataArray.push(wordData);
            session.completedWords.push(word);
            await saveCheckpoint(session, 'in_progress');
            console.log(
                `[${index + 1}/${words.length}] OK: ${word} [${modelUsed}]`,
            );
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            session.failedWords.push(word);
            await saveCheckpoint(session, 'in_progress');
            console.error(
                `[${index + 1}/${words.length}] FAIL: ${word} — ${message}`,
            );
        }
    }
}

function showUsage(): void {
    console.log(
        'Usage:\n' +
            '  tsx scripts/generate-word-migration-pipeline.ts <file> [options]\n' +
            '  tsx scripts/generate-word-migration-pipeline.ts --from-prod [options]\n\n' +
            'File mode:\n' +
            '  e.g. new_words.en.txt or spanish_verbs.es.txt\n\n' +
            'Prod mode (SSH tunnel + DB fetch from .env.local):\n' +
            '  --from-prod              Fetch words from production DB\n' +
            '  --language en|es|ru      Required with --from-prod\n' +
            '  --source DEEPL           Source filter (default: DEEPL)\n' +
            '                           Also: MYMEMORY, external\n' +
            '  --limit N                Limit number of words fetched\n' +
            '  --no-tunnel              Use an already-open tunnel\n' +
            '  --export-only            Fetch to .txt only, skip Cursor\n' +
            '  --tunnel-only            Start SSH tunnel and wait (Ctrl+C to exit)\n\n' +
            'Options:\n' +
            '  --force-restart          Ignore checkpoint and start from scratch\n' +
            '  --finalize               Build migration.sql from checkpoint without Cursor\n' +
            '  --check-only             Validate input file (not implemented)',
    );
}

interface ProdFetchResult {
    filePath: string;
    migrationName: string;
    languageCode: SupportedLanguage;
    wordCount: number;
}

async function prepareWordsFromProd(argv: string[]): Promise<ProdFetchResult> {
    const languageRaw = getFlagValue(argv, '--language');
    if (!languageRaw) {
        throw new Error('--language is required with --from-prod');
    }

    const languageCode = validateLanguageCode(languageRaw);
    const sourceRaw = getFlagValue(argv, '--source') ?? 'DEEPL';
    const source = validateSourceFilter(sourceRaw);
    const limitRaw = getFlagValue(argv, '--limit');
    const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;

    if (limitRaw && (!limit || limit < 1)) {
        throw new Error(`Invalid --limit value: ${limitRaw}`);
    }

    const skipTunnel = hasFlag(argv, '--no-tunnel');
    activeTunnel = await ensureSshTunnel({ skipTunnel });

    const migrationName = buildMigrationNameFromProd(source, languageCode);
    const outputDir = path.join(__dirname, 'temp', 'prod-word-lists');

    console.log(
        `Fetching words from prod: language=${languageCode}, source=${source}` +
            (limit ? `, limit=${limit}` : ''),
    );

    const words = await fetchWordsFromProd({
        languageCode,
        source,
        limit,
    });

    if (words.length === 0) {
        throw new Error(
            `No words found for language=${languageCode}, source=${source}`,
        );
    }

    const filePath = await writeWordsToFile(
        words,
        migrationName,
        languageCode,
        outputDir,
    );

    console.log(`Exported ${words.length} words to ${filePath}`);

    return {
        filePath,
        migrationName,
        languageCode,
        wordCount: words.length,
    };
}

async function runMigrationPipeline(
    filePath: string,
    migrationName: string,
    languageCode: string,
    options: {
        forceRestart: boolean;
        finalizeOnly: boolean;
        checkOnly: boolean;
    },
): Promise<void> {
    const words = await readWordsFromFile(filePath);

    console.log(
        `Loaded ${words.length} ${languageCode} words. ` +
            `Models: primary=${DEFAULT_AI_MODEL}, fallback=${FALLBACK_AI_MODEL}`,
    );

    if (options.checkOnly) {
        console.log('--check-only is not implemented yet.');
        return;
    }

    const session = await initializeSession(
        filePath,
        migrationName,
        languageCode,
        words.length,
        options.forceRestart,
    );
    activeSession = session;

    if (options.finalizeOnly) {
        const isComplete =
            session.completedWords.length + session.failedWords.length >=
            session.totalRequested;
        const migrationDir = await finalizeSession(
            session,
            isComplete ? 'complete' : 'partial',
        );
        const relativeDir = path.relative(
            path.join(__dirname, '..'),
            migrationDir,
        );
        console.log(
            `Migration finalized from checkpoint: ${relativeDir} ` +
                `(${session.wordDataArray.length} words, ` +
                `status=${isComplete ? 'complete' : 'partial'})`,
        );
        return;
    }

    await ensureCursorCliLogin();
    await runGenerationLoop(session);

    if (shuttingDown) {
        return;
    }

    if (session.wordDataArray.length === 0) {
        console.error('No words were successfully generated.');
        process.exit(1);
    }

    const isComplete =
        session.completedWords.length + session.failedWords.length >=
        session.totalRequested;
    const migrationDir = await finalizeSession(
        session,
        isComplete ? 'complete' : 'partial',
    );
    const relativeDir = path.relative(path.join(__dirname, '..'), migrationDir);
    const checksum = calculateChecksum(
        await fs.readFile(path.join(migrationDir, 'migration.sql'), 'utf8'),
    );

    console.log(
        `Migration created: ${relativeDir} ` +
            `(${session.wordDataArray.length} words, ` +
            `status=${isComplete ? 'complete' : 'partial'}, ` +
            `checksum=${checksum})`,
    );

    if (session.failedWords.length > 0) {
        console.log(`Skipped ${session.failedWords.length} failed words:`);
        session.failedWords.forEach(word => console.log(`  ${word}`));
    }
}

async function main() {
    loadMigrationEnv();
    delete process.env.CURSOR_API_KEY;
    registerShutdownHandlers();

    try {
        const config = await import('./cursor/config.mjs');
        DEFAULT_AI_MODEL = config.DEFAULT_AI_MODEL || 'composer-2.5';
        FALLBACK_AI_MODEL = config.FALLBACK_AI_MODEL || 'gpt-5-mini';
    } catch {
        // fall back to defaults above
    }

    const argv = process.argv.slice(2);
    const args = argv.filter(arg => !arg.startsWith('--'));
    const forceRestart = hasFlag(argv, '--force-restart');
    const finalizeOnly = hasFlag(argv, '--finalize');
    const checkOnly = hasFlag(argv, '--check-only');
    const fromProd = hasFlag(argv, '--from-prod');
    const exportOnly = hasFlag(argv, '--export-only');
    const tunnelOnly = hasFlag(argv, '--tunnel-only');

    if (tunnelOnly) {
        await runTunnelOnly();
        return;
    }

    if (exportOnly && !fromProd) {
        console.error('--export-only requires --from-prod');
        process.exit(1);
    }

    let filePath: string;
    let migrationName: string;
    let languageCode: string;

    try {
        if (fromProd) {
            const prodResult = await prepareWordsFromProd(argv);
            filePath = prodResult.filePath;
            migrationName = prodResult.migrationName;
            languageCode = prodResult.languageCode;

            if (exportOnly) {
                console.log('Export complete (--export-only).');
                return;
            }
        } else {
            if (args.length === 0) {
                showUsage();
                process.exit(1);
            }

            filePath = path.resolve(args[0]);
            const words = await readWordsFromFile(filePath);
            languageCode = words[0]?.languageCode || 'en';
            const fileName = path.basename(filePath);
            const match = fileName.match(/^(.+)\.([a-z]{2})\.txt$/);
            migrationName = match ? match[1] : 'migration';
        }

        await runMigrationPipeline(filePath, migrationName, languageCode, {
            forceRestart,
            finalizeOnly,
            checkOnly,
        });
    } catch (error) {
        console.error(
            'Script failed:',
            error instanceof Error ? error.message : error,
        );
        process.exit(1);
    } finally {
        await closeActiveTunnel();
    }
}

main();
