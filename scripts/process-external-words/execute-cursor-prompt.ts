import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { DEFAULT_AI_MODEL } from '../cursor/config.mjs';

// Получаем директорию текущего файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Счетчик пайплайна
const counterFile = path.join(__dirname, 'temp', 'pipeline-counter.txt');

async function getCurrentCounter(): Promise<number> {
    try {
        const counterData = await fs.readFile(counterFile, 'utf8');
        return parseInt(counterData.trim());
    } catch (error) {
        // Файл не существует, начинаем с 1
        return 1;
    }
}

// Глобальные переменные для логов (будут инициализированы асинхронно)
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
    } catch (error) {
        // Папка не существует, создаем ее
        await fs.mkdir(datePath, { recursive: true });
    }
    return datePath;
}

async function initializeLogger(): Promise<void> {
    const now = new Date();
    timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    dateFolder = now.toISOString().slice(0, 10); // YYYY-MM-DD

    currentCounter = await getCurrentCounter();

    // Создаем папки с датами
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
        // Ищем в папке с текущей датой
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

        // Сортируем по дате модификации файла (новые первыми)
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
        await log(`📁 Found latest prompt file: ${latestPromptFile}`);

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
        await log(`📖 Read prompt content (${content.length} characters)`);
        return content;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        throw new Error(
            `Error reading prompt file ${promptFilePath}: ${errorMessage}`,
        );
    }
}

async function extractWordFromPromptFileName(
    promptFilePath: string,
): Promise<string> {
    // Извлекаем слово из имени файла: формат counter-word-prompt-timestamp.txt
    const fileName = path.basename(promptFilePath, '.txt');
    const match = fileName.match(/^\d+-(.+)-prompt-/);
    if (!match) {
        throw new Error(
            `Could not extract word from prompt file name: ${fileName}`,
        );
    }
    const word = match[1];
    await log(`🔤 Extracted word from file name: "${word}"`);
    return word;
}

async function executeCursorAgent(
    promptContent: string,
    word: string,
): Promise<string> {
    // Создаем папку с датой для temp файлов
    const tempDatePath = await ensureDateFolder(
        path.join(__dirname, 'temp'),
        dateFolder,
    );

    const resultFileName = `${currentCounter}-${word}-cursor-result-${timestamp}.json`;
    const resultFilePath = path.join(tempDatePath, resultFileName);

    // Используем cursor agent с --print --output-format json --model
    const cursorCommand = `/Applications/Cursor.app/Contents/Resources/app/bin/cursor agent --print --output-format json --model ${DEFAULT_AI_MODEL}`;

    await log(`🚀 Executing Cursor Agent with prompt for word: "${word}"`);
    await log(`🤖 Using AI model: ${DEFAULT_AI_MODEL}`);
    await log(`📝 Command: ${cursorCommand}`);
    await log(`📄 Result will be saved to: ${resultFilePath}`);

    try {
        // Выполняем cursor agent с промптом через stdin
        // IMPORTANT: Set cwd to tempDatePath so Cursor Agent saves any files there
        const childProcess = spawn(cursorCommand, {
            cwd: tempDatePath,
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

        // Отправляем промпт в stdin
        childProcess.stdin.write(promptContent);
        childProcess.stdin.end();

        // Собираем вывод
        childProcess.stdout.on('data', data => {
            stdout += data.toString();
        });

        childProcess.stderr.on('data', data => {
            stderr += data.toString();
        });

        // Ждем завершения
        await new Promise<void>((resolve, reject) => {
            childProcess.on('close', async code => {
                // Логируем вывод перед проверкой кода возврата
                if (stderr && stderr.trim()) {
                    await log(`⚠️ Cursor agent stderr: ${stderr}`);
                }
                if (stdout && stdout.trim() && code !== 0) {
                    await log(
                        `📋 Cursor agent stdout: ${stdout.substring(0, 500)}${stdout.length > 500 ? '...' : ''}`,
                    );
                }

                if (code === 0) {
                    resolve();
                } else {
                    reject(
                        new Error(
                            `Cursor agent exited with code ${code}. Check stderr/stdout above for details.`,
                        ),
                    );
                }
            });

            childProcess.on('error', reject);
        });

        await log(`✅ Cursor agent completed successfully`);
        await log(`📊 Result size: ${stdout.length} characters`);

        // Парсим результат от Cursor agent
        let cleanJson = '';
        try {
            const parsedResponse = JSON.parse(stdout);

            if (parsedResponse.result) {
                // Извлекаем JSON из поля result
                const resultText = parsedResponse.result;

                // Ищем JSON блок в тексте
                const jsonMatch = resultText.match(
                    /```json\s*(\{[\s\S]*?\})\s*```/,
                );
                if (jsonMatch) {
                    cleanJson = jsonMatch[1];
                    await log(`✅ Extracted JSON from Cursor response`);
                } else {
                    // Если не нашли JSON блок, попробуем найти сам JSON
                    const jsonStart = resultText.indexOf('{');
                    const jsonEnd = resultText.lastIndexOf('}');
                    if (jsonStart !== -1 && jsonEnd !== -1) {
                        cleanJson = resultText.substring(
                            jsonStart,
                            jsonEnd + 1,
                        );
                        await log(`✅ Extracted JSON from text`);
                    } else {
                        throw new Error('Could not find JSON in response');
                    }
                }
            } else {
                cleanJson = stdout;
            }

            // Сохраняем очищенный JSON
            await fs.writeFile(resultFilePath, cleanJson, 'utf8');
            await log(`💾 Clean JSON result saved to: ${resultFilePath}`);

            // Проверяем, что результат валидный JSON
            const parsedResult = JSON.parse(cleanJson);
            await log(
                `✅ Result is valid JSON with word: "${parsedResult.word || 'unknown'}"`,
            );
            if (parsedResult.partOfSpeech) {
                await log(
                    `✅ Detected part of speech: ${parsedResult.partOfSpeech}`,
                );
            }
            if (parsedResult.grammaticalExamples) {
                await log(`✅ Found grammatical examples for verb`);
            }
        } catch (parseError) {
            const errorMessage =
                parseError instanceof Error
                    ? parseError.message
                    : String(parseError);
            await log(`⚠️ Warning: Could not parse JSON: ${errorMessage}`);
            // Сохраняем оригинальный ответ как есть
            await fs.writeFile(resultFilePath, stdout, 'utf8');
            await log(`💾 Raw result saved to: ${resultFilePath}`);
        }

        return resultFilePath;
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        await log(`❌ Error executing cursor agent: ${errorMessage}`);
        throw error;
    }
}

async function main(): Promise<void> {
    await initializeLogger();
    await log('🚀 Starting Cursor Agent execution script');

    try {
        // Находим последний промпт-файл
        const promptFilePath = await findLatestPromptFile();

        // Читаем содержимое промпта
        const promptContent = await readPromptContent(promptFilePath);

        // Извлекаем слово из имени файла промпта
        const word = await extractWordFromPromptFileName(promptFilePath);

        // Выполняем промпт через Cursor Agent
        const resultFilePath = await executeCursorAgent(promptContent, word);

        await log(`🎉 Execution completed successfully!`);
        await log(`📝 Log saved to: ${logFilePath}`);
        await log(`📄 Result available at: ${resultFilePath}`);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        await log(`❌ Script failed: ${errorMessage}`);
        console.error('Error details:', error);
        process.exit(1);
    }
}

main();
