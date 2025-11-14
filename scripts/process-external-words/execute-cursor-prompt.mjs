import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Получаем директорию текущего файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Пути к файлам
const tempDir = path.join(__dirname, 'temp');

// Создаем timestamp для лог-файла
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const logFileName = `execute-cursor-prompt-${timestamp}.log`;
const logFilePath = path.join(__dirname, 'logs', logFileName);

async function log(message) {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    console.log(message);
    await fs.appendFile(logFilePath, logEntry);
}

async function findLatestPromptFile() {
    try {
        const files = await fs.readdir(tempDir);
        const promptFiles = files.filter(
            file => file.startsWith('prompt-') && file.endsWith('.txt'),
        );

        if (promptFiles.length === 0) {
            throw new Error('No prompt files found in temp directory');
        }

        // Сортируем по дате модификации файла (новые первыми)
        const sortedPromptFiles = await Promise.all(
            promptFiles.map(async file => {
                const filePath = path.join(tempDir, file);
                const stats = await fs.stat(filePath);
                return {
                    name: file,
                    path: filePath,
                    mtime: stats.mtime,
                };
            }),
        );

        sortedPromptFiles.sort((a, b) => b.mtime - a.mtime);

        const latestPromptFile = sortedPromptFiles[0].path;
        await log(`📁 Found latest prompt file: ${latestPromptFile}`);

        return latestPromptFile;
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`Temp directory ${tempDir} does not exist`);
        }
        throw error;
    }
}

async function readPromptContent(promptFilePath) {
    try {
        const content = await fs.readFile(promptFilePath, 'utf8');
        await log(`📖 Read prompt content (${content.length} characters)`);
        return content;
    } catch (error) {
        throw new Error(
            `Error reading prompt file ${promptFilePath}: ${error.message}`,
        );
    }
}

async function extractWordFromPromptContent(promptContent) {
    // Ищем слово в промпте по паттерну: For the Spanish word "word"
    const match = promptContent.match(/For the \w+ word "([^"]+)"/);
    if (!match) {
        throw new Error('Could not extract word from prompt content');
    }
    const word = match[1];
    await log(`🔤 Extracted word from prompt: "${word}"`);
    return word;
}

async function executeCursorAgent(promptContent, word) {
    const resultFileName = `cursor-result-${word}-${timestamp}.json`;
    const resultFilePath = path.join(tempDir, resultFileName);

    // Используем cursor agent с --print --output-format json
    const cursorCommand = `/Applications/Cursor.app/Contents/Resources/app/bin/cursor agent --print --output-format json`;

    await log(`🚀 Executing Cursor Agent with prompt for word: "${word}"`);
    await log(`📄 Result will be saved to: ${resultFilePath}`);

    try {
        // Выполняем cursor agent с промптом через stdin
        const childProcess = spawn(cursorCommand, {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
            shell: true,
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
        await new Promise((resolve, reject) => {
            childProcess.on('close', code => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Cursor agent exited with code ${code}`));
                }
            });

            childProcess.on('error', reject);
        });

        if (stderr && stderr.trim()) {
            await log(`⚠️ Cursor agent stderr: ${stderr}`);
        }

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
            if (parsedResult.grammaticalExamples) {
                await log(`✅ Found grammatical examples for verb`);
            }
        } catch (parseError) {
            await log(
                `⚠️ Warning: Could not parse JSON: ${parseError.message}`,
            );
            // Сохраняем оригинальный ответ как есть
            await fs.writeFile(resultFilePath, stdout, 'utf8');
            await log(`💾 Raw result saved to: ${resultFilePath}`);
        }

        return resultFilePath;
    } catch (error) {
        await log(`❌ Error executing cursor agent: ${error.message}`);
        throw error;
    }
}

async function main() {
    await log('🚀 Starting Cursor Agent execution script');

    try {
        // Находим последний промпт-файл
        const promptFilePath = await findLatestPromptFile();

        // Читаем содержимое промпта
        const promptContent = await readPromptContent(promptFilePath);

        // Извлекаем слово из промпта
        const word = await extractWordFromPromptContent(promptContent);

        // Выполняем промпт через Cursor Agent
        const resultFilePath = await executeCursorAgent(promptContent, word);

        await log(`🎉 Execution completed successfully!`);
        await log(`📝 Log saved to: ${logFilePath}`);
        await log(`📄 Result available at: ${resultFilePath}`);
    } catch (error) {
        await log(`❌ Script failed: ${error.message}`);
        console.error('Error details:', error);
        process.exit(1);
    }
}

main();
