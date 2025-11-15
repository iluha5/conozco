import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Получаем директорию текущего файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Счетчик пайплайна
const counterFile = path.join(__dirname, 'temp', 'pipeline-counter.txt');
let counter = 1;

async function getNextCounter(): Promise<number> {
    try {
        const counterData = await fs.readFile(counterFile, 'utf8');
        counter = parseInt(counterData.trim()) + 1;
    } catch (error) {
        // Файл не существует, начинаем с 1
        counter = 1;
    }
    await fs.writeFile(counterFile, counter.toString());
    return counter;
}

// Глобальные переменные для логов (будут инициализированы асинхронно)
let logFilePath = '';
let currentCounter = 1;
let timestamp = '';

async function initializeLogger(): Promise<void> {
    timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    currentCounter = await getNextCounter();
    const logFileName = `${currentCounter}-get-external-words-${timestamp}.log`;
    logFilePath = path.join(__dirname, 'logs', logFileName);
}

async function log(message: string): Promise<void> {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    console.log(message);
    if (logFilePath) {
        await fs.appendFile(logFilePath, logEntry);
    }
}

interface SimplifiedWord {
    id: string;
    word: string;
    language: {
        id: string;
        code: string;
        name: string;
    };
    translationLanguage: {
        id: string;
        code: string;
        name: string;
    };
}

async function main(): Promise<void> {
    await initializeLogger();
    await log('🚀 Starting external words retrieval script');
    await log('🔍 Getting external words from BaseWord...');

    try {
        // Получаем первые 10 слов из BaseWord, где source.code !== 'native'
        const externalWords = await prisma.baseWord.findMany({
            where: {
                source: {
                    code: {
                        not: 'native',
                    },
                },
            },
            take: 10,
            include: {
                language: true,
                partOfSpeech: true,
                translations: {
                    include: {
                        language: true,
                    },
                },
            },
        });

        await log(`✅ Found ${externalWords.length} external words`);

        // Логируем список найденных слов
        const wordList = externalWords.map(word => word.word).join(', ');
        await log(`📝 Found words: ${wordList}`);

        // Создаем упрощенный массив с только нужными полями
        const simplifiedWords: SimplifiedWord[] = [];

        for (const word of externalWords) {
            // Получаем уникальные языки переводов
            const translationLanguages = Array.from(
                new Set(word.translations.map(t => t.language.code))
            );

            for (const translationLangCode of translationLanguages) {
                const translationLang = word.translations.find(
                    t => t.language.code === translationLangCode,
                )?.language;

                if (translationLang) {
                    simplifiedWords.push({
                        id: word.id.toString(),
                        word: word.word,
                        language: {
                            id: word.language.id.toString(),
                            code: word.language.code,
                            name: word.language.name,
                        },
                        translationLanguage: {
                            id: translationLang.id.toString(),
                            code: translationLang.code,
                            name: translationLang.name,
                        },
                    });
                }
            }
        }

        // Путь к выходному файлу
        const outputPath = path.join(
            __dirname,
            'temp',
            'external-words-output.json',
        );

        // Проверяем и удаляем существующий файл, если он есть
        try {
            await fs.access(outputPath);
            await log(`🗑️ Removing existing output file: ${outputPath}`);
            await fs.unlink(outputPath);
        } catch (error) {
            // Файл не существует, это нормально
            await log(
                `📄 Output file does not exist, will create new one: ${outputPath}`,
            );
        }

        // Записываем результат в JSON файл
        await fs.writeFile(
            outputPath,
            JSON.stringify(simplifiedWords, null, 2),
            'utf8',
        );

        await log(`💾 Results saved to: ${outputPath}`);
        await log(`📊 Total word-language pairs: ${simplifiedWords.length}`);
        await log(`📝 Log saved to: ${logFilePath}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await log(`❌ Error getting external words: ${errorMessage}`);
        process.exit(1);
    }
}

main()
    .catch(async e => {
        console.error(`❌ Script error: ${e.message}`);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
