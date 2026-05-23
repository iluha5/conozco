import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const counterFile = path.join(__dirname, 'temp', 'pipeline-counter.txt');

// Type definitions
interface CursorResult {
    word: string;
    partOfSpeech?: string;
    languageCode?: string;
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

    const logFileName = `${currentCounter}-import-word-data-${timestamp}.log`;
    logFilePath = path.join(logsDatePath, logFileName);
}

async function log(message: string): Promise<void> {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    console.log(message);
    if (logFilePath) {
        await fs.appendFile(logFilePath, logEntry);
    }
}

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
    const sourceLanguage = cursorResult.languageCode || 'es';

    const getTargetLanguages = (sourceLang: string): string[] => {
        if (sourceLang === 'es') return ['ru', 'en'];
        if (sourceLang === 'en') return ['ru', 'es'];
        return ['ru'];
    };

    const targetLanguages = getTargetLanguages(sourceLanguage);

    const cursorPOS = cursorResult.partOfSpeech || 'noun';
    const dbPartOfSpeech =
        partOfSpeechMapping[cursorPOS.toLowerCase()] || 'NOUN';

    const examples = cursorResult.sentences.map((sentence, index) => {
        const text = typeof sentence === 'object' ? sentence.text : sentence;

        const translations = targetLanguages.map(lang => ({
            languageCode: lang,
            translation:
                typeof sentence === 'object' && sentence.translation
                    ? lang === 'ru'
                        ? sentence.translation
                        : `Translation to ${lang}`
                    : `Translation ${index + 1} to ${lang}`,
        }));

        return {
            pronoun: 'yo',
            example: text,
            translations: translations,
            sentenceTypeCode: 'AFFIRMATIVE',
            isNegative: false,
            isQuestion: text.includes('?'),
        };
    });

    let grammaticalExamples: {
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
    }[] = [];
    if (cursorResult.grammaticalExamples) {
        if (sourceLanguage === 'es') {
            [
                'Presente de indicativo',
                'Futuro próximo',
                'Pretérito indefinido',
            ].forEach(tenseName => {
                const examples =
                    cursorResult.grammaticalExamples?.[
                        tenseName as keyof typeof cursorResult.grammaticalExamples
                    ];
                if (examples && Array.isArray(examples)) {
                    examples.forEach((example: any) => {
                        const text =
                            typeof example === 'object'
                                ? example.text
                                : example;

                        const translations = targetLanguages.map(lang => ({
                            languageCode: lang,
                            translation:
                                typeof example === 'object' &&
                                example.translation
                                    ? lang === 'ru'
                                        ? example.translation
                                        : `Translation to ${lang}`
                                    : `${tenseName} translation to ${lang}`,
                        }));

                        grammaticalExamples.push({
                            tenseName: tenseName,
                            examples: [
                                {
                                    pronoun: 'yo',
                                    example: text,
                                    translations: translations,
                                    sentenceTypeCode: 'AFFIRMATIVE',
                                    isNegative: false,
                                    isQuestion: false,
                                },
                            ],
                        });
                    });
                }
            });

            if (cursorResult.grammaticalExamples.negative) {
                const negativeExample =
                    cursorResult.grammaticalExamples.negative;
                const text =
                    typeof negativeExample === 'object'
                        ? negativeExample.text
                        : negativeExample;

                const translations = targetLanguages.map(lang => ({
                    languageCode: lang,
                    translation:
                        typeof negativeExample === 'object' &&
                        negativeExample.translation
                            ? lang === 'ru'
                                ? negativeExample.translation
                                : `Negative translation to ${lang}`
                            : `Negative translation to ${lang}`,
                }));

                examples.push({
                    pronoun: 'yo',
                    example: text,
                    translations: translations,
                    sentenceTypeCode: 'NEGATIVE',
                    isNegative: true,
                    isQuestion: false,
                });
            }

            if (cursorResult.grammaticalExamples.question) {
                const questionExample =
                    cursorResult.grammaticalExamples.question;
                const text =
                    typeof questionExample === 'object'
                        ? questionExample.text
                        : questionExample;

                const translations = targetLanguages.map(lang => ({
                    languageCode: lang,
                    translation:
                        typeof questionExample === 'object' &&
                        questionExample.translation
                            ? lang === 'ru'
                                ? questionExample.translation
                                : `Question translation to ${lang}`
                            : `Question translation to ${lang}`,
                }));

                examples.push({
                    pronoun: 'yo',
                    example: text,
                    translations: translations,
                    sentenceTypeCode: 'QUESTION',
                    isNegative: false,
                    isQuestion: true,
                });
            }
        }
    }

    const wordTranslations = targetLanguages.map(lang => ({
        languageCode: lang,
        translations: cursorResult.translations,
    }));

    return {
        word: cursorResult.word,
        partOfSpeech: dbPartOfSpeech,
        languageCode: sourceLanguage,
        translations: wordTranslations,
        examples: examples,
        grammaticalExamples: grammaticalExamples,
    };
}

async function getOrCreateLanguage(languageCode: string) {
    let language = await prisma.language.findUnique({
        where: { code: languageCode },
    });

    if (!language) {
        language = await prisma.language.create({
            data: {
                code: languageCode,
                name: languageCode.toUpperCase(),
            },
        });
        await log(`Created new language: ${languageCode}`);
    }

    return language;
}

async function getOrCreatePartOfSpeech(
    partOfSpeechName: string,
    _languageId: number,
) {
    const posMapping: Record<string, string> = {
        noun: 'NOUN',
        verb: 'VERB',
        adjective: 'ADJECTIVE',
        adverb: 'ADVERB',
        pronoun: 'PRONOUN',
        preposition: 'PREPOSITION',
        conjunction: 'CONJUNCTION',
        interjection: 'INTERJECTION',
        article: 'ARTICLE',
        determiner: 'DETERMINER',
        numeral: 'NUMERAL',
        phrase: 'PHRASE',
    };

    const normalizedName =
        posMapping[partOfSpeechName.toLowerCase()] ||
        partOfSpeechName.toUpperCase();

    let partOfSpeech = await prisma.partOfSpeech.findUnique({
        where: {
            name: normalizedName,
        },
    });

    if (!partOfSpeech) {
        partOfSpeech = await prisma.partOfSpeech.create({
            data: { name: normalizedName },
        });
        await log(
            `Created new part of speech: ${normalizedName} (from ${partOfSpeechName})`,
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
        sentenceType = await prisma.sentenceType.create({
            data: {
                code: sentenceTypeCode,
                displayName: sentenceTypeCode.toLowerCase().replace('_', ' '),
                isNegative: isNegative,
                isQuestion: isQuestion,
            },
        });
        await log(`Created new sentence type: ${sentenceTypeCode}`);
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
        pronounRecord = await prisma.pronoun.create({
            data: { pronoun: pronoun, languageId: languageId },
        });
        await log(`Created new pronoun: ${pronoun} for language ${languageId}`);
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
        tense = await prisma.tense.create({
            data: { name: tenseName, languageId: languageId },
        });
        await log(`Created new tense: ${tenseName} for language ${languageId}`);
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
    await prisma.wordExample.deleteMany({
        where: { baseWordId: baseWordId },
    });
    await prisma.grammaticalExample.deleteMany({
        where: { baseWordId: baseWordId },
    });
}

async function importWordData(wordData: WordData): Promise<boolean> {
    await log(`Processing word: ${wordData.word}`);

    const language = await getOrCreateLanguage(wordData.languageCode);
    const partOfSpeech = await getOrCreatePartOfSpeech(
        wordData.partOfSpeech,
        language.id,
    );
    const wordSource = await getWordSource('native');

    let baseWord = await prisma.baseWord.findUnique({
        where: {
            word_languageId: {
                word: wordData.word,
                languageId: language.id,
            },
        },
    });

    if (!baseWord) {
        baseWord = await prisma.baseWord.create({
            data: {
                word: wordData.word,
                languageId: language.id,
                sourceId: wordSource.id,
            },
        });
        await log(`Created word: ${wordData.word} (id=${baseWord.id})`);
    } else {
        await log(`Found existing word: ${wordData.word} (id=${baseWord.id})`);
    }

    await prisma.wordTranslation.deleteMany({
        where: { baseWordId: baseWord.id },
    });

    for (const translationGroup of wordData.translations) {
        const translationLanguage = await getOrCreateLanguage(
            translationGroup.languageCode,
        );

        let priority = 1;
        for (const translation of translationGroup.translations.slice(0, 3)) {
            await prisma.wordTranslation.create({
                data: {
                    baseWordId: baseWord.id,
                    languageId: translationLanguage.id,
                    translation: translation,
                    priority: priority++,
                    partOfSpeechId: partOfSpeech.id,
                },
            });
        }
    }

    await clearWordExamples(baseWord.id);

    for (const example of wordData.examples) {
        const pronoun = await getOrCreatePronoun(example.pronoun, language.id);

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

        for (const translation of example.translations) {
            const translationLanguage = await getOrCreateLanguage(
                translation.languageCode,
            );

            await prisma.wordExample.create({
                data: {
                    baseWordId: baseWord.id,
                    pronounId: pronoun.id,
                    example: example.example,
                    translation: translation.translation,
                    translationLanguageId: translationLanguage.id,
                    sentenceTypeId: sentenceType.id,
                    sourceId: wordSource.id,
                },
            });
        }
    }

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

            for (const translation of example.translations) {
                const translationLanguage = await getOrCreateLanguage(
                    translation.languageCode,
                );

                await prisma.grammaticalExample.create({
                    data: {
                        baseWordId: baseWord.id,
                        tenseId: tense.id,
                        pronounId: pronoun.id,
                        example: example.example,
                        translation: translation.translation,
                        translationLanguageId: translationLanguage.id,
                        sentenceTypeId: sentenceType.id,
                        sourceId: wordSource.id,
                    },
                });
            }
        }
    }

    // Mark as 'native' so the next pipeline run skips it.
    const nativeSource = await getWordSource('native');
    await prisma.baseWord.update({
        where: { id: baseWord.id },
        data: { sourceId: nativeSource.id },
    });

    await log(
        `Imported "${wordData.word}" (id=${baseWord.id}, examples=${wordData.examples.length}).`,
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

    await log(`Importing word data from ${jsonFilePath}`);

    try {
        const jsonData = await fs.readFile(jsonFilePath, 'utf8');
        const rawData = JSON.parse(jsonData);

        let wordDataArray: WordData[] = [];
        if (Array.isArray(rawData)) {
            wordDataArray = rawData;
        } else if (
            rawData.word &&
            rawData.partOfSpeech &&
            rawData.languageCode &&
            rawData.translations &&
            rawData.examples
        ) {
            wordDataArray = [rawData as WordData];
        } else if (rawData.word && rawData.translations && rawData.sentences) {
            wordDataArray = [transformCursorResultToWordData(rawData)];
        } else {
            throw new Error(
                'Invalid data format: expected array, WordData object, or Cursor result object',
            );
        }

        let processedCount = 0;
        let skippedCount = 0;

        for (const wordData of wordDataArray) {
            const success = await importWordData(wordData);
            if (success) processedCount++;
            else skippedCount++;
        }

        await log(
            `Done. Imported: ${processedCount}. Skipped: ${skippedCount}. Log: ${logFilePath}.`,
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        await log(`Error importing word data: ${errorMessage}`);
        console.error('Full error:', error);
        process.exit(1);
    }
}

main()
    .catch(async e => {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error(`Script error: ${errorMessage}`);
        console.error('Full error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
