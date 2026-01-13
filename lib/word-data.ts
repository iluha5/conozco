// Re-export word data from separate file
export {
    WORDS_DATA,
    PartOfSpeech,
    SentenceTypeCode,
    type WordData,
} from './words-seed-data';

import type { SentenceTypeCode as SentenceTypeCodeEnum } from './words-seed-data';

// Function to import word data into database
export async function importWordsData(
    prisma: any,
    partsOfSpeechRecords: Record<string, any>,
    wordSources: Record<string, { id: number }>,
) {
    // Import word data from separate file
    const { WORDS_DATA, SentenceTypeCode } = await import('./words-seed-data');

    const sentenceTypes = await prisma.sentenceType.findMany();
    const sentenceTypeByCode = new Map(
        sentenceTypes.map((type: any) => [type.code, type]),
    );

    type SentenceTypeFlags = {
        sentenceTypeCode?: SentenceTypeCodeEnum;
        isNegative?: boolean;
        isQuestion?: boolean;
    };

    const resolveSentenceTypeCode = ({
        sentenceTypeCode,
        isNegative,
        isQuestion,
    }: SentenceTypeFlags) => {
        if (sentenceTypeCode) {
            return sentenceTypeCode;
        }
        if (isNegative && isQuestion) {
            return SentenceTypeCode.NEGATIVE_QUESTION;
        }
        if (isNegative) {
            return SentenceTypeCode.NEGATIVE;
        }
        if (isQuestion) {
            return SentenceTypeCode.QUESTION;
        }
        return SentenceTypeCode.AFFIRMATIVE;
    };

    const getSentenceTypeId = (flags: SentenceTypeFlags): number => {
        const code = resolveSentenceTypeCode(flags);
        const sentenceType = sentenceTypeByCode.get(code) as
            | { id: number }
            | undefined;

        if (!sentenceType) {
            throw new Error(`Sentence type with code ${code} is not seeded`);
        }

        return sentenceType.id;
    };

    for (const wordData of WORDS_DATA) {
        // Find or create language
        let language = await prisma.language.findUnique({
            where: { code: wordData.languageCode },
        });

        if (!language) {
            const languageNames: Record<string, string> = {
                es: 'Spanish',
                en: 'English',
                ru: 'Russian',
            };

            language = await prisma.language.create({
                data: {
                    code: wordData.languageCode,
                    name:
                        languageNames[wordData.languageCode] ||
                        wordData.languageCode,
                },
            });
        }

        // Create or update base word
        const baseWord = await prisma.baseWord.upsert({
            where: {
                word_languageId: {
                    word: wordData.word,
                    languageId: language.id,
                },
            },
            update: {
                sourceId: wordSources['native'].id,
            },
            create: {
                word: wordData.word,
                languageId: language.id,
                sourceId: wordSources['native'].id,
            },
        });

        // Add translations
        for (const translationGroup of wordData.translations) {
            const translationLanguage = await prisma.language.findUnique({
                where: { code: translationGroup.languageCode },
            });

            if (translationLanguage) {
                for (let i = 0; i < translationGroup.translations.length; i++) {
                    await prisma.wordTranslation.upsert({
                        where: {
                            baseWordId_languageId_priority: {
                                baseWordId: baseWord.id,
                                languageId: translationLanguage.id,
                                priority: i + 1,
                            },
                        },
                        update: {
                            translation: translationGroup.translations[i],
                            partOfSpeechId:
                                partsOfSpeechRecords[wordData.partOfSpeech].id,
                        },
                        create: {
                            baseWordId: baseWord.id,
                            languageId: translationLanguage.id,
                            translation: translationGroup.translations[i],
                            priority: i + 1,
                            partOfSpeechId:
                                partsOfSpeechRecords[wordData.partOfSpeech].id,
                        },
                    });
                }
            }
        }

        // Add pronouns if they don't exist yet
        const pronounsByLanguage: Record<string, string[]> = {
            es: [
                'yo',
                'tú',
                'él',
                'ella',
                'nosotros',
                'vosotros',
                'ellos',
                'ellas',
            ],
            en: ['I', 'you', 'he', 'she', 'we', 'they', 'it'],
        };

        const pronouns = pronounsByLanguage[wordData.languageCode] || [];
        const pronounRecords: Record<string, any> = {};

        for (const pronoun of pronouns) {
            let pronounRecord = await prisma.pronoun.findUnique({
                where: {
                    pronoun_languageId: {
                        pronoun,
                        languageId: language.id,
                    },
                },
            });

            if (!pronounRecord) {
                pronounRecord = await prisma.pronoun.create({
                    data: {
                        pronoun,
                        languageId: language.id,
                    },
                });
            }

            pronounRecords[pronoun] = pronounRecord;
        }

        // Get Russian language for example translations
        const russianLanguage = await prisma.language.findUnique({
            where: { code: 'ru' },
        });

        if (!russianLanguage) {
            throw new Error('Russian language not found in database');
        }

        // Add simple examples
        for (const example of wordData.examples) {
            if (pronounRecords[example.pronoun]) {
                await prisma.wordExample.create({
                    data: {
                        baseWordId: baseWord.id,
                        pronounId: pronounRecords[example.pronoun].id,
                        example: example.example,
                        translation: example.translation,
                        translationLanguageId: russianLanguage.id,
                        sentenceTypeId: getSentenceTypeId(example),
                        sourceId: wordSources['native'].id,
                    },
                });
            }
        }

        // Add tenses if they don't exist yet and this is a verb
        if (
            wordData.partOfSpeech ===
            (await import('./words-seed-data')).PartOfSpeech.VERB
        ) {
            const tenseRecords: Record<string, any> = {};

            for (const tenseGroup of wordData.grammaticalExamples) {
                let tense = await prisma.tense.findUnique({
                    where: {
                        name_languageId: {
                            name: tenseGroup.tenseName,
                            languageId: language.id,
                        },
                    },
                });

                if (!tense) {
                    tense = await prisma.tense.create({
                        data: {
                            name: tenseGroup.tenseName,
                            languageId: language.id,
                        },
                    });
                }

                tenseRecords[tenseGroup.tenseName] = tense;

                // Add grammatical examples
                for (const example of tenseGroup.examples) {
                    if (pronounRecords[example.pronoun]) {
                        await prisma.grammaticalExample.create({
                            data: {
                                baseWordId: baseWord.id,
                                tenseId: tense.id,
                                pronounId: pronounRecords[example.pronoun].id,
                                example: example.example,
                                translation: example.translation,
                                translationLanguageId: language.id, // Translation language - Russian
                                sentenceTypeId: getSentenceTypeId(example),
                                sourceId: wordSources['native'].id,
                            },
                        });
                    }
                }
            }
        }
    }
}
