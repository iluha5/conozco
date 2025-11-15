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

// Type definitions
interface CursorResult {
    word: string;
    partOfSpeech?: string;
    translations: string[];
    sentences: (string | { text: string; translation: string })[];
    grammaticalExamples?: {
        'Presente de indicativo'?: (
            | string
            | { text: string; translation: string }
        )[];
        'Futuro próximo'?: (string | { text: string; translation: string })[];
        'Pretérito indefinido'?: (
            | string
            | { text: string; translation: string }
        )[];
        negative?: string | { text: string; translation: string };
        question?: string | { text: string; translation: string };
    };
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
        translation: string;
        sentenceTypeCode: string;
        isNegative: boolean;
        isQuestion: boolean;
    }[];
    grammaticalExamples: {
        tenseName: string;
        examples: {
            pronoun: string;
            example: string;
            translation: string;
            sentenceTypeCode: string;
            isNegative: boolean;
            isQuestion: boolean;
        }[];
    }[];
}

interface GrammaticalExample {
    tenseName: string;
    examples: {
        pronoun: string;
        example: string;
        translation: string;
        sentenceTypeCode: string;
        isNegative: boolean;
        isQuestion: boolean;
    }[];
}

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

async function initializeLogger(): Promise<void> {
    timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    currentCounter = await getCurrentCounter();
    const logFileName = `${currentCounter}-import-word-data-${timestamp}.log`;
    logFilePath = path.join(__dirname, 'logs', logFileName);
}

async function log(message: string): Promise<void> {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    console.log(message);
    if (logFilePath) {
        await fs.appendFile(logFilePath, logEntry);
    }
}

// Маппинг частей речи от Cursor к нашей БД
const partOfSpeechMapping: Record<string, string> = {
    noun: 'NOUN',
    verb: 'VERB',
    adjective: 'ADJECTIVE',
    adverb: 'ADVERB',
    pronoun: 'PRONOUN',
    preposition: 'PREPOSITION',
    conjunction: 'CONJUNCTION',
    interjection: 'INTERJECTION',
};

function transformCursorResultToWordData(cursorResult: CursorResult): WordData {
    // Получаем язык слова из контекста (предполагаем испанский)
    // В реальном сценарии это нужно получать из файла промпта или параметров
    const sourceLanguage = 'es'; // Испанский
    const targetLanguage = 'ru'; // Русский

    // Получаем часть речи из ответа Cursor с маппингом
    const cursorPOS = cursorResult.partOfSpeech || 'noun'; // По умолчанию существительное
    const dbPartOfSpeech =
        partOfSpeechMapping[cursorPOS.toLowerCase()] || 'NOUN';

    // Преобразуем предложения в формат импорта
    const examples = cursorResult.sentences.map((sentence, index) => {
        // Проверяем, является ли sentence объектом или строкой (для обратной совместимости)
        const text = typeof sentence === 'object' ? sentence.text : sentence;
        const translation =
            typeof sentence === 'object'
                ? sentence.translation
                : `Перевод ${index + 1}`;

        return {
            pronoun: 'yo', // Заглушка, можно улучшить
            example: text,
            translation: translation,
            sentenceTypeCode: 'AFFIRMATIVE',
            isNegative: false,
            isQuestion: text.includes('?'),
        };
    });

    // Преобразуем grammaticalExamples, если они есть (для глаголов)
    let grammaticalExamples: GrammaticalExample[] = [];
    if (cursorResult.grammaticalExamples) {
        // Для испанского языка
        if (sourceLanguage === 'es') {
            // Presente de indicativo
            if (cursorResult.grammaticalExamples['Presente de indicativo']) {
                cursorResult.grammaticalExamples[
                    'Presente de indicativo'
                ].forEach(example => {
                    const text =
                        typeof example === 'object' ? example.text : example;
                    const translation =
                        typeof example === 'object'
                            ? example.translation
                            : `Перевод примера`;

                    grammaticalExamples.push({
                        tenseName: 'Presente de indicativo',
                        examples: [
                            {
                                pronoun: 'yo',
                                example: text,
                                translation: translation,
                                sentenceTypeCode: 'AFFIRMATIVE',
                                isNegative: false,
                                isQuestion: false,
                            },
                        ],
                    });
                });
            }

            // Futuro próximo
            if (cursorResult.grammaticalExamples['Futuro próximo']) {
                cursorResult.grammaticalExamples['Futuro próximo'].forEach(
                    example => {
                        const text =
                            typeof example === 'object'
                                ? example.text
                                : example;
                        const translation =
                            typeof example === 'object'
                                ? example.translation
                                : `Перевод примера`;

                        grammaticalExamples.push({
                            tenseName: 'Futuro próximo',
                            examples: [
                                {
                                    pronoun: 'yo',
                                    example: text,
                                    translation: translation,
                                    sentenceTypeCode: 'AFFIRMATIVE',
                                    isNegative: false,
                                    isQuestion: false,
                                },
                            ],
                        });
                    },
                );
            }

            // Pretérito indefinido
            if (cursorResult.grammaticalExamples['Pretérito indefinido']) {
                cursorResult.grammaticalExamples[
                    'Pretérito indefinido'
                ].forEach(example => {
                    const text =
                        typeof example === 'object' ? example.text : example;
                    const translation =
                        typeof example === 'object'
                            ? example.translation
                            : `Перевод примера`;

                    grammaticalExamples.push({
                        tenseName: 'Pretérito indefinido',
                        examples: [
                            {
                                pronoun: 'yo',
                                example: text,
                                translation: translation,
                                sentenceTypeCode: 'AFFIRMATIVE',
                                isNegative: false,
                                isQuestion: false,
                            },
                        ],
                    });
                });
            }

            // Отрицательное предложение
            if (cursorResult.grammaticalExamples.negative) {
                const negativeExample =
                    cursorResult.grammaticalExamples.negative;
                const text =
                    typeof negativeExample === 'object'
                        ? negativeExample.text
                        : negativeExample;
                const translation =
                    typeof negativeExample === 'object'
                        ? negativeExample.translation
                        : `Отрицательный перевод`;

                examples.push({
                    pronoun: 'yo',
                    example: text,
                    translation: translation,
                    sentenceTypeCode: 'NEGATIVE',
                    isNegative: true,
                    isQuestion: false,
                });
            }

            // Вопросительное предложение
            if (cursorResult.grammaticalExamples.question) {
                const questionExample =
                    cursorResult.grammaticalExamples.question;
                const text =
                    typeof questionExample === 'object'
                        ? questionExample.text
                        : questionExample;
                const translation =
                    typeof questionExample === 'object'
                        ? questionExample.translation
                        : `Вопросительный перевод`;

                examples.push({
                    pronoun: 'yo',
                    example: text,
                    translation: translation,
                    sentenceTypeCode: 'QUESTION',
                    isNegative: false,
                    isQuestion: true,
                });
            }
        }
        // Аналогично можно добавить обработку для английского языка
    }

    return {
        word: cursorResult.word,
        partOfSpeech: dbPartOfSpeech, // Используем определенную Cursor часть речи
        languageCode: sourceLanguage,
        translations: [
            {
                languageCode: targetLanguage,
                translations: cursorResult.translations,
            },
        ],
        examples: examples,
        grammaticalExamples: grammaticalExamples,
    };
}

async function getOrCreateLanguage(languageCode: string) {
    let language = await prisma.language.findUnique({
        where: { code: languageCode },
    });

    if (!language) {
        // Создаем язык, если не существует
        language = await prisma.language.create({
            data: {
                code: languageCode,
                name: languageCode.toUpperCase(),
            },
        });
        await log(`📝 Created new language: ${languageCode}`);
    }

    return language;
}

async function getOrCreatePartOfSpeech(
    partOfSpeechName: string,
    languageId: number,
) {
    let partOfSpeech = await prisma.partOfSpeech.findUnique({
        where: {
            name_languageId: {
                name: partOfSpeechName,
                languageId: languageId,
            },
        },
    });

    if (!partOfSpeech) {
        // Создаем часть речи, если не существует
        partOfSpeech = await prisma.partOfSpeech.create({
            data: {
                name: partOfSpeechName,
                displayName: partOfSpeechName.toLowerCase(),
                languageId: languageId,
            },
        });
        await log(
            `📝 Created new part of speech: ${partOfSpeechName} for language ${languageId}`,
        );
    }

    return partOfSpeech;
}

async function getOrCreateSentenceType(
    sentenceTypeCode: string,
    isNegative: boolean = false,
    isQuestion: boolean = false,
) {
    let sentenceType = await prisma.sentenceType.findUnique({
        where: { code: sentenceTypeCode },
    });

    if (!sentenceType) {
        // Создаем тип предложения, если не существует
        sentenceType = await prisma.sentenceType.create({
            data: {
                code: sentenceTypeCode,
                displayName: sentenceTypeCode.toLowerCase().replace('_', ' '),
                isNegative: isNegative,
                isQuestion: isQuestion,
            },
        });
        await log(`📝 Created new sentence type: ${sentenceTypeCode}`);
    }

    return sentenceType;
}

async function getOrCreatePronoun(pronoun: string, languageId: number) {
    let pronounRecord = await prisma.pronoun.findUnique({
        where: {
            pronoun_languageId: {
                pronoun: pronoun,
                languageId: languageId,
            },
        },
    });

    if (!pronounRecord) {
        // Создаем местоимение, если не существует
        pronounRecord = await prisma.pronoun.create({
            data: {
                pronoun: pronoun,
                languageId: languageId,
            },
        });
        await log(
            `📝 Created new pronoun: ${pronoun} for language ${languageId}`,
        );
    }

    return pronounRecord;
}

async function getOrCreateTense(tenseName: string, languageId: number) {
    let tense = await prisma.tense.findUnique({
        where: {
            name_languageId: {
                name: tenseName,
                languageId: languageId,
            },
        },
    });

    if (!tense) {
        // Создаем время, если не существует
        tense = await prisma.tense.create({
            data: {
                name: tenseName,
                languageId: languageId,
            },
        });
        await log(
            `📝 Created new tense: ${tenseName} for language ${languageId}`,
        );
    }

    return tense;
}

async function getWordSource(sourceCode: string = 'native') {
    let source = await prisma.wordSource.findUnique({
        where: { code: sourceCode },
    });

    if (!source) {
        throw new Error(`Word source with code '${sourceCode}' not found`);
    }

    return source;
}

async function clearWordExamples(baseWordId: number) {
    // Удаляем существующие примеры и грамматические примеры для слова
    await prisma.wordExample.deleteMany({
        where: { baseWordId: baseWordId },
    });
    await prisma.grammaticalExample.deleteMany({
        where: { baseWordId: baseWordId },
    });
}

async function importWordData(wordData: WordData): Promise<boolean> {
    await log(`🔄 Processing word: ${wordData.word}`);

    // Получаем или создаем базовые сущности
    const language = await getOrCreateLanguage(wordData.languageCode);
    const partOfSpeech = await getOrCreatePartOfSpeech(
        wordData.partOfSpeech,
        language.id,
    );
    const wordSource = await getWordSource('native'); // Используем native для импортированных данных

    // Ищем существующее слово
    const baseWord = await prisma.baseWord.findUnique({
        where: {
            word_languageId: {
                word: wordData.word,
                languageId: language.id,
            },
        },
    });

    if (!baseWord) {
        await log(
            `⚠️ Word not found in database: ${wordData.word} (language: ${wordData.languageCode})`,
        );
        await log(
            `⏭️ Skipping word: ${wordData.word} - it must be created first`,
        );
        return false; // Пропускаем слово, которое не существует в БД
    }

    await log(`📝 Found existing word: ${wordData.word} (ID: ${baseWord.id})`);

    // Обновляем часть речи, если она изменилась
    if (baseWord.partOfSpeechId !== partOfSpeech.id) {
        await prisma.baseWord.update({
            where: { id: baseWord.id },
            data: { partOfSpeechId: partOfSpeech.id },
        });
        await log(`📝 Updated part of speech for: ${wordData.word}`);
    }

    // Добавляем переводы (только новые, не существующие)
    for (const translationGroup of wordData.translations) {
        const translationLanguage = await getOrCreateLanguage(
            translationGroup.languageCode,
        );

        // Получаем максимальный существующий priority для этого слова и языка
        const maxPriorityResult = await prisma.wordTranslation.findFirst({
            where: {
                baseWordId: baseWord.id,
                languageId: translationLanguage.id,
            },
            orderBy: {
                priority: 'desc',
            },
            select: {
                priority: true,
            },
        });

        let nextPriority = (maxPriorityResult?.priority || 0) + 1;

        for (const translation of translationGroup.translations.slice(0, 3)) {
            // Проверяем, существует ли уже такой перевод
            const existingTranslation = await prisma.wordTranslation.findFirst({
                where: {
                    baseWordId: baseWord.id,
                    languageId: translationLanguage.id,
                    translation: translation,
                },
            });

            if (!existingTranslation) {
                await prisma.wordTranslation.create({
                    data: {
                        baseWordId: baseWord.id,
                        languageId: translationLanguage.id,
                        translation: translation,
                        priority: nextPriority++,
                    },
                });
                await log(
                    `➕ Added new translation: "${translation}" for ${wordData.word}`,
                );
            } else {
                await log(
                    `⏭️ Translation already exists: "${translation}" for ${wordData.word}`,
                );
            }
        }
    }

    await log(`✅ Processed translations for: ${wordData.word}`);

    // Удаляем существующие примеры и грамматические примеры для этого слова
    if (baseWord) {
        await clearWordExamples(baseWord.id);
        await log(`🗑️ Cleared existing examples for: ${wordData.word}`);
    }

    // Добавляем примеры (всегда новые, так как старые удалены)
    for (const example of wordData.examples) {
        const pronoun = await getOrCreatePronoun(example.pronoun, language.id);

        // Определяем sentenceTypeCode
        let sentenceTypeCode = 'AFFIRMATIVE';
        if (example.sentenceTypeCode) {
            sentenceTypeCode = example.sentenceTypeCode;
        } else if (example.isQuestion && example.isNegative) {
            sentenceTypeCode = 'NEGATIVE_QUESTION';
        } else if (example.isQuestion) {
            sentenceTypeCode = 'QUESTION';
        } else if (example.isNegative) {
            sentenceTypeCode = 'NEGATIVE';
        }

        const sentenceType = await getOrCreateSentenceType(
            sentenceTypeCode,
            example.isNegative || false,
            example.isQuestion || false,
        );

        await prisma.wordExample.create({
            data: {
                baseWordId: baseWord.id,
                pronounId: pronoun.id,
                example: example.example,
                translation: example.translation,
                translationLanguageId: language.id, // Используем язык слова для перевода
                sentenceTypeId: sentenceType.id,
                sourceId: wordSource.id,
            },
        });
    }

    await log(
        `✅ Added ${wordData.examples.length} examples for: ${wordData.word}`,
    );

    // Добавляем грамматические примеры (всегда новые, так как старые удалены)
    for (const grammaticalExample of wordData.grammaticalExamples) {
        const tense = await getOrCreateTense(
            grammaticalExample.tenseName,
            language.id,
        );

        for (const example of grammaticalExample.examples) {
            const pronoun = await getOrCreatePronoun(
                example.pronoun,
                language.id,
            );

            // Определяем sentenceTypeCode для грамматического примера
            let sentenceTypeCode = 'AFFIRMATIVE';
            if (example.sentenceTypeCode) {
                sentenceTypeCode = example.sentenceTypeCode;
            } else if (example.isQuestion && example.isNegative) {
                sentenceTypeCode = 'NEGATIVE_QUESTION';
            } else if (example.isQuestion) {
                sentenceTypeCode = 'QUESTION';
            } else if (example.isNegative) {
                sentenceTypeCode = 'NEGATIVE';
            }

            const sentenceType = await getOrCreateSentenceType(
                sentenceTypeCode,
                example.isNegative || false,
                example.isQuestion || false,
            );

            await prisma.grammaticalExample.create({
                data: {
                    baseWordId: baseWord.id,
                    tenseId: tense.id,
                    pronounId: pronoun.id,
                    example: example.example,
                    translation: example.translation,
                    sentenceTypeId: sentenceType.id,
                    sourceId: wordSource.id,
                },
            });
        }
    }

    await log(`✅ Added grammatical examples for: ${wordData.word}`);
    await log(
        `🎉 Successfully updated word: ${wordData.word} (ID: ${baseWord.id})`,
    );
    return true;
}

async function main() {
    await initializeLogger();

    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.error('Usage: node import-word-data.ts <path-to-json-file>');
        console.error(
            'Example: node import-word-data.ts ./temp/word-data.json',
        );
        process.exit(1);
    }

    const jsonFilePath = args[0];

    await log('🚀 Starting word data import script');
    await log(`📁 Input file: ${jsonFilePath}`);

    try {
        // Читаем JSON файл
        const jsonData = await fs.readFile(jsonFilePath, 'utf8');
        let rawData = JSON.parse(jsonData);

        // Преобразуем данные в массив, если пришел одиночный объект
        let wordDataArray: WordData[] = [];
        if (Array.isArray(rawData)) {
            wordDataArray = rawData;
        } else if (rawData.word && rawData.translations && rawData.sentences) {
            // Преобразуем формат от Cursor agent в формат импорта
            const transformedData = transformCursorResultToWordData(rawData);
            wordDataArray = [transformedData];
        } else {
            throw new Error(
                'Invalid data format: expected array or Cursor result object',
            );
        }

        await log(`📊 Found ${wordDataArray.length} words to process`);

        let processedCount = 0;
        let skippedCount = 0;

        // Обрабатываем каждое слово
        for (const wordData of wordDataArray) {
            const success = await importWordData(wordData);
            if (success) {
                processedCount++;
            } else {
                skippedCount++;
            }
        }

        await log(`🎉 Import completed!`);
        await log(`📊 Processed: ${processedCount} words`);
        if (skippedCount > 0) {
            await log(
                `⚠️ Skipped: ${skippedCount} words (not found in database)`,
            );
        }
        await log(`📝 Log saved to: ${logFilePath}`);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        await log(`❌ Error importing word data: ${errorMessage}`);
        console.error('Full error:', error);
        process.exit(1);
    }
}

main()
    .catch(async e => {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error(`❌ Script error: ${errorMessage}`);
        console.error('Full error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
