import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Получаем директорию текущего файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем timestamp для лог-файла
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const logFileName = `import-word-data-${timestamp}.log`;
const logFilePath = path.join(__dirname, 'logs', logFileName);

async function log(message) {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    console.log(message);
    await fs.appendFile(logFilePath, logEntry);
}

function transformCursorResultToWordData(cursorResult) {
    // Получаем язык слова из контекста (предполагаем испанский)
    // В реальном сценарии это нужно получать из файла промпта или параметров
    const sourceLanguage = 'es'; // Испанский
    const targetLanguage = 'ru'; // Русский

    // Преобразуем предложения в формат импорта
    const examples = cursorResult.sentences.map((sentence, index) => ({
        pronoun: 'yo', // Заглушка, можно улучшить
        example: sentence,
        translation: `Перевод ${index + 1}`, // Заглушка, в реальности нужно переводить
        sentenceTypeCode: 'AFFIRMATIVE',
        isNegative: false,
        isQuestion: sentence.includes('?')
    }));

    return {
        word: cursorResult.word,
        partOfSpeech: 'VERB', // Заглушка, можно определить автоматически
        languageCode: sourceLanguage,
        translations: [
            {
                languageCode: targetLanguage,
                translations: cursorResult.translations
            }
        ],
        examples: examples,
        grammaticalExamples: [] // Пустой массив, можно расширить позже
    };
}

async function getOrCreateLanguage(languageCode) {
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

async function getOrCreatePartOfSpeech(partOfSpeechName, languageId) {
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
    sentenceTypeCode,
    isNegative = false,
    isQuestion = false,
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

async function getOrCreatePronoun(pronoun, languageId) {
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

async function getOrCreateTense(tenseName, languageId) {
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

async function getWordSource(sourceCode = 'native') {
    let source = await prisma.wordSource.findUnique({
        where: { code: sourceCode },
    });

    if (!source) {
        throw new Error(`Word source with code '${sourceCode}' not found`);
    }

    return source;
}

async function deleteExistingWordData(word, languageId) {
    // Находим существующее слово
    const existingWord = await prisma.baseWord.findUnique({
        where: {
            word_languageId: {
                word: word,
                languageId: languageId,
            },
        },
        include: {
            translations: true,
            examples: true,
            grammaticalExamples: true,
        },
    });

    if (existingWord) {
        await log(`🗑️ Deleting existing word data for: ${word}`);

        // Удаляем связанные данные
        if (existingWord.translations.length > 0) {
            await prisma.wordTranslation.deleteMany({
                where: { baseWordId: existingWord.id },
            });
        }

        if (existingWord.examples.length > 0) {
            await prisma.wordExample.deleteMany({
                where: { baseWordId: existingWord.id },
            });
        }

        if (existingWord.grammaticalExamples.length > 0) {
            await prisma.grammaticalExample.deleteMany({
                where: { baseWordId: existingWord.id },
            });
        }

        // Удаляем само слово
        await prisma.baseWord.delete({
            where: { id: existingWord.id },
        });
    }
}

async function importWordData(wordData) {
    await log(`🔄 Processing word: ${wordData.word}`);

    // Получаем или создаем базовые сущности
    const language = await getOrCreateLanguage(wordData.languageCode);
    const partOfSpeech = await getOrCreatePartOfSpeech(
        wordData.partOfSpeech,
        language.id,
    );
    const wordSource = await getWordSource('native'); // Используем native для импортированных данных

    // Удаляем существующие данные для этого слова
    await deleteExistingWordData(wordData.word, language.id);

    // Создаем новое слово
    const baseWord = await prisma.baseWord.create({
        data: {
            word: wordData.word,
            partOfSpeechId: partOfSpeech.id,
            languageId: language.id,
            sourceId: wordSource.id,
        },
    });

    await log(`✅ Created base word: ${wordData.word} (ID: ${baseWord.id})`);

    // Добавляем переводы
    for (const translationGroup of wordData.translations) {
        const translationLanguage = await getOrCreateLanguage(
            translationGroup.languageCode,
        );

        for (
            let i = 0;
            i < translationGroup.translations.length && i < 3;
            i++
        ) {
            const translation = translationGroup.translations[i];
            await prisma.wordTranslation.create({
                data: {
                    baseWordId: baseWord.id,
                    languageId: translationLanguage.id,
                    translation: translation,
                    priority: i + 1,
                },
            });
        }
    }

    await log(`✅ Added translations for: ${wordData.word}`);

    // Добавляем примеры
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

    // Добавляем грамматические примеры
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
    await log(`🎉 Successfully imported word: ${wordData.word}`);
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.error('Usage: node import-word-data.mjs <path-to-json-file>');
        console.error(
            'Example: node import-word-data.mjs ./temp/word-data.json',
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
        let wordDataArray = [];
        if (Array.isArray(rawData)) {
            wordDataArray = rawData;
        } else if (rawData.word && rawData.translations && rawData.sentences) {
            // Преобразуем формат от Cursor agent в формат импорта
            const transformedData = transformCursorResultToWordData(rawData);
            wordDataArray = [transformedData];
        } else {
            throw new Error('Invalid data format: expected array or Cursor result object');
        }

        await log(`📊 Found ${wordDataArray.length} words to import`);

        // Обрабатываем каждое слово
        for (const wordData of wordDataArray) {
            await importWordData(wordData);
        }

        await log(`🎉 Import completed successfully!`);
        await log(`📝 Log saved to: ${logFilePath}`);
    } catch (error) {
        await log(`❌ Error importing word data: ${error.message}`);
        console.error('Full error:', error);
        process.exit(1);
    }
}

main()
    .catch(async e => {
        await log(`❌ Script error: ${e.message}`);
        console.error('Full error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
