import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pipeline counter
const counterFile = path.join(__dirname, 'temp', 'pipeline-counter.txt');
let counter = 1;

async function getNextCounter(): Promise<number> {
    try {
        const counterData = await fs.readFile(counterFile, 'utf8');
        counter = parseInt(counterData.trim()) + 1;
    } catch (error) {
        // File does not exist, start with 1
        counter = 1;
    }
    await fs.writeFile(counterFile, counter.toString());
    return counter;
}

// Global variables for logs (will be initialized asynchronously)
let logFilePath = '';
let tempOutputPath = '';
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
        // Folder does not exist, create it
        await fs.mkdir(datePath, { recursive: true });
    }
    return datePath;
}

async function initializeLogger(): Promise<void> {
    const now = new Date();
    timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    dateFolder = now.toISOString().slice(0, 10); // YYYY-MM-DD

    currentCounter = await getNextCounter();

    // Create folders with dates
    const logsDatePath = await ensureDateFolder(
        path.join(__dirname, 'logs'),
        dateFolder,
    );
    const tempDatePath = await ensureDateFolder(
        path.join(__dirname, 'temp'),
        dateFolder,
    );

    const logFileName = `${currentCounter}-get-external-words-${timestamp}.log`;
    logFilePath = path.join(logsDatePath, logFileName);

    const tempFileName = 'external-words-output.json';
    tempOutputPath = path.join(tempDatePath, tempFileName);
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
    partOfSpeech?: {
        name: string;
    };
}

async function main(): Promise<void> {
    await initializeLogger();
    await log('🚀 Starting external words retrieval script');
    await log('🔍 Getting external words from BaseWord...');

    try {
        // Get first 10 words from BaseWord where source.code !== 'native'
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
                translations: {
                    include: {
                        language: true,
                        partOfSpeech: true,
                    },
                },
            },
        });

        await log(`✅ Found ${externalWords.length} external words`);

        // Log list of found words
        const wordList = externalWords.map(word => word.word).join(', ');
        await log(`📝 Found words: ${wordList}`);

        // Create simplified array with only needed fields
        const simplifiedWords: SimplifiedWord[] = [];

        for (const word of externalWords) {
            // Get unique translation languages
            const translationLanguages = Array.from(
                new Set(word.translations.map(t => t.language.code)),
            );

            // If word has no translations, use default translation language (Russian)
            if (translationLanguages.length === 0) {
                // Get or create Russian language as target translation language
                const russianLanguage = await prisma.language.findUnique({
                    where: { code: 'ru' },
                });

                if (russianLanguage) {
                    simplifiedWords.push({
                        id: word.id.toString(),
                        word: word.word,
                        language: {
                            id: word.language.id.toString(),
                            code: word.language.code,
                            name: word.language.name,
                        },
                        translationLanguage: {
                            id: russianLanguage.id.toString(),
                            code: russianLanguage.code,
                            name: russianLanguage.name,
                        },
                        partOfSpeech: word.translations?.[0]?.partOfSpeech
                            ? {
                                  name: word.translations[0].partOfSpeech.name,
                              }
                            : undefined,
                    });
                } else {
                    await log(
                        `⚠️ Warning: Russian language not found in database for word: ${word.word}`,
                    );
                }
            } else {
                // If translations exist, create pairs as before
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
                            partOfSpeech: word.translations?.[0]?.partOfSpeech
                                ? {
                                      name: word.translations[0].partOfSpeech
                                          .name,
                                  }
                                : undefined,
                        });
                    }
                }
            }
        }

        // Check and remove existing file if it exists
        try {
            await fs.access(tempOutputPath);
            await log(`🗑️ Removing existing output file: ${tempOutputPath}`);
            await fs.unlink(tempOutputPath);
        } catch (error) {
            // File does not exist, this is normal
            await log(
                `📄 Output file does not exist, will create new one: ${tempOutputPath}`,
            );
        }

        // Write result to JSON file
        await fs.writeFile(
            tempOutputPath,
            JSON.stringify(simplifiedWords, null, 2),
            'utf8',
        );

        await log(`💾 Results saved to: ${tempOutputPath}`);
        await log(`📊 Total word-language pairs: ${simplifiedWords.length}`);
        await log(`📝 Log saved to: ${logFilePath}`);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
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
