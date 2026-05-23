import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { DEFAULT_AI_MODEL } from '../cursor/config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const counterFile = path.join(__dirname, 'temp', 'pipeline-counter.txt');

async function getCurrentCounter(): Promise<number> {
    try {
        const counterData = await fs.readFile(counterFile, 'utf8');
        return parseInt(counterData.trim());
    } catch {
        return 1;
    }
}

let logFilePath = '';
let currentCounter = 1;
let timestamp = '';
let dateFolder = '';

async function ensureDateFolder(
    basePath: string,
    dateStr: string,
): Promise<string> {
    const datePath = path.join(basePath, dateStr);
    try {
        await fs.access(datePath);
    } catch {
        await fs.mkdir(datePath, { recursive: true });
    }
    return datePath;
}

async function initializeLogger(): Promise<void> {
    const now = new Date();
    timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    dateFolder = now.toISOString().slice(0, 10);

    currentCounter = await getCurrentCounter();

    const logsDatePath = await ensureDateFolder(
        path.join(__dirname, 'logs'),
        dateFolder,
    );

    const logFileName = `${currentCounter}-execute-cursor-prompt-${timestamp}.log`;
    logFilePath = path.join(logsDatePath, logFileName);
}

async function log(message: string): Promise<void> {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    console.log(message);
    if (logFilePath) {
        await fs.appendFile(logFilePath, logEntry);
    }
}

interface PromptFile {
    name: string;
    path: string;
    mtime: Date;
}

async function findLatestPromptFile(): Promise<string> {
    try {
        const tempDatePath = await ensureDateFolder(
            path.join(__dirname, 'temp'),
            dateFolder,
        );
        const files = await fs.readdir(tempDatePath);
        const promptFiles = files.filter(
            file =>
                (file.startsWith('prompt-') ||
                    /^\d+-.*-prompt-.*\.txt$/.test(file)) &&
                file.endsWith('.txt'),
        );

        if (promptFiles.length === 0) {
            throw new Error('No prompt files found in temp directory');
        }

        const sortedPromptFiles: PromptFile[] = await Promise.all(
            promptFiles.map(async file => {
                const filePath = path.join(tempDatePath, file);
                const stats = await fs.stat(filePath);
                return {
                    name: file,
                    path: filePath,
                    mtime: stats.mtime,
                };
            }),
        );

        sortedPromptFiles.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

        const latestPromptFile = sortedPromptFiles[0].path;
        await log(`Found latest prompt file: ${latestPromptFile}`);

        return latestPromptFile;
    } catch (error) {
        if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 'ENOENT'
        ) {
            throw new Error(`Temp directory does not exist`);
        }
        throw error;
    }
}

async function readPromptContent(promptFilePath: string): Promise<string> {
    try {
        const content = await fs.readFile(promptFilePath, 'utf8');
        await log(`Read prompt content (${content.length} characters)`);
        return content;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        throw new Error(
            `Error reading prompt file ${promptFilePath}: ${errorMessage}`,
        );
    }
}

// Filename format: counter-word-prompt-timestamp.txt
async function extractWordFromPromptFileName(
    promptFilePath: string,
): Promise<string> {
    const fileName = path.basename(promptFilePath, '.txt');
    const match = fileName.match(/^\d+-(.+)-prompt-/);
    if (!match) {
        throw new Error(
            `Could not extract word from prompt file name: ${fileName}`,
        );
    }
    return match[1];
}

async function executeCursorAgent(
    promptContent: string,
    word: string,
): Promise<string> {
    const tempDatePath = await ensureDateFolder(
        path.join(__dirname, 'temp'),
        dateFolder,
    );

    const resultFileName = `${currentCounter}-${word}-cursor-result-${timestamp}.json`;
    const resultFilePath = path.join(tempDatePath, resultFileName);

    const cursorCommand = `/Applications/Cursor.app/Contents/Resources/app/bin/cursor agent --print --output-format json --model ${DEFAULT_AI_MODEL}`;

    await log(
        `Executing Cursor Agent for word "${word}" (model=${DEFAULT_AI_MODEL})`,
    );

    try {
        // cwd=tempDatePath so any side-effect files end up under the dated temp folder.
        const childProcess = spawn(cursorCommand, {
            cwd: tempDatePath,
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

        childProcess.stdin.write(promptContent);
        childProcess.stdin.end();

        childProcess.stdout.on('data', data => {
            stdout += data.toString();
        });
        childProcess.stderr.on('data', data => {
            stderr += data.toString();
        });

        await new Promise<void>((resolve, reject) => {
            childProcess.on('close', async code => {
                if (stderr && stderr.trim()) {
                    await log(`Cursor agent stderr: ${stderr}`);
                }
                if (stdout && stdout.trim() && code !== 0) {
                    await log(
                        `Cursor agent stdout: ${stdout.substring(0, 500)}${stdout.length > 500 ? '...' : ''}`,
                    );
                }

                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Cursor agent exited with code ${code}.`));
                }
            });

            childProcess.on('error', reject);
        });

        let cleanJson = '';
        try {
            const parsedResponse = JSON.parse(stdout);

            if (parsedResponse.result) {
                const resultText = parsedResponse.result;
                const jsonMatch = resultText.match(
                    /```json\s*(\{[\s\S]*?\})\s*```/,
                );
                if (jsonMatch) {
                    cleanJson = jsonMatch[1];
                } else {
                    const jsonStart = resultText.indexOf('{');
                    const jsonEnd = resultText.lastIndexOf('}');
                    if (jsonStart !== -1 && jsonEnd !== -1) {
                        cleanJson = resultText.substring(
                            jsonStart,
                            jsonEnd + 1,
                        );
                    } else {
                        throw new Error('Could not find JSON in response');
                    }
                }
            } else {
                cleanJson = stdout;
            }

            await fs.writeFile(resultFilePath, cleanJson, 'utf8');

            const parsedResult = JSON.parse(cleanJson);
            await log(
                `Saved result for "${parsedResult.word || 'unknown'}" -> ${resultFilePath}`,
            );
        } catch (parseError) {
            const errorMessage =
                parseError instanceof Error
                    ? parseError.message
                    : String(parseError);
            await log(
                `Could not parse JSON: ${errorMessage}; saving raw output.`,
            );
            await fs.writeFile(resultFilePath, stdout, 'utf8');
        }

        return resultFilePath;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        await log(`Error executing cursor agent: ${errorMessage}`);
        throw error;
    }
}

async function main(): Promise<void> {
    await initializeLogger();

    try {
        const promptFilePath = await findLatestPromptFile();
        const promptContent = await readPromptContent(promptFilePath);
        const word = await extractWordFromPromptFileName(promptFilePath);
        const resultFilePath = await executeCursorAgent(promptContent, word);

        await log(`Done. Result: ${resultFilePath}. Log: ${logFilePath}.`);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        await log(`Script failed: ${errorMessage}`);
        console.error('Error details:', error);
        process.exit(1);
    }
}

main();
