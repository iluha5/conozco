import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This script will be used to process individual words
// Word data should be generated using LLM and passed as JSON

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
        sentenceTypeCode?: string;
        isNegative?: boolean;
        isQuestion?: boolean;
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
            sentenceTypeCode?: string;
            isNegative?: boolean;
            isQuestion?: boolean;
        }[];
    }[];
}

async function getOrCreateLanguage(code: string) {
    let language = await prisma.language.findUnique({
        where: { code },
    });

    if (!language) {
        const languageNames: Record<string, string> = {
            es: 'Spanish',
            en: 'English',
            ru: 'Russian',
        };

        language = await prisma.language.create({
            data: {
                code,
                name: languageNames[code] || code,
            },
        });
    }

    return language;
}

async function getOrCreatePartOfSpeech(name: string) {
    let partOfSpeech = await prisma.partOfSpeech.findUnique({
        where: { name },
    });

    if (!partOfSpeech) {
        partOfSpeech = await prisma.partOfSpeech.create({
            data: { name },
        });
    }

    return partOfSpeech;
}

async function getOrCreateSentenceType(
    code: string,
    isNegative: boolean,
    isQuestion: boolean,
) {
    let sentenceType = await prisma.sentenceType.findUnique({
        where: {
            isNegative_isQuestion: {
                isNegative,
                isQuestion,
            },
        },
    });

    if (!sentenceType) {
        sentenceType = await prisma.sentenceType.create({
            data: {
                code,
                displayName: code.toLowerCase().replace('_', ' '),
                isNegative,
                isQuestion,
            },
        });
    }

    return sentenceType;
}

async function getOrCreatePronoun(pronoun: string, languageId: number) {
    let pronounRecord = await prisma.pronoun.findUnique({
        where: {
            pronoun_languageId: {
                pronoun,
                languageId,
            },
        },
    });

    if (!pronounRecord) {
        pronounRecord = await prisma.pronoun.create({
            data: {
                pronoun,
                languageId,
            },
        });
    }

    return pronounRecord;
}

async function getOrCreateTense(tenseName: string, languageId: number) {
    let tense = await prisma.tense.findUnique({
        where: {
            name_languageId: {
                name: tenseName,
                languageId,
            },
        },
    });

    if (!tense) {
        tense = await prisma.tense.create({
            data: {
                name: tenseName,
                languageId,
            },
        });
    }

    return tense;
}

async function getWordSource(sourceCode: string = 'native') {
    const source = await prisma.wordSource.findUnique({
        where: { code: sourceCode },
    });

    if (!source) {
        throw new Error(`Word source with code '${sourceCode}' not found`);
    }

    return source;
}

export async function importWordData(
    wordData: WordData,
): Promise<number | null> {
    const language = await getOrCreateLanguage(wordData.languageCode);
    const partOfSpeech = await getOrCreatePartOfSpeech(wordData.partOfSpeech);
    const wordSource = await getWordSource('native');

    // Проверяем, существует ли слово
    let baseWord = await prisma.baseWord.findUnique({
        where: {
            word_languageId: {
                word: wordData.word,
                languageId: language.id,
            },
        },
    });

    if (!baseWord) {
        // Создаем новое слово
        baseWord = await prisma.baseWord.create({
            data: {
                word: wordData.word,
                languageId: language.id,
                sourceId: wordSource.id,
            },
        });
        console.log(
            `➕ Created new word: ${wordData.word} (ID: ${baseWord.id})`,
        );
    } else {
        console.log(
            `📝 Found existing word: ${wordData.word} (ID: ${baseWord.id})`,
        );
        // Возвращаем ID существующего слова, но не добавляем данные повторно
        return baseWord.id;
    }

    // Добавляем переводы (не более 3 на язык)
    for (const translationGroup of wordData.translations) {
        const translationLanguage = await getOrCreateLanguage(
            translationGroup.languageCode,
        );

        let priority = 1;
        for (const translation of translationGroup.translations.slice(0, 3)) {
            await prisma.wordTranslation.upsert({
                where: {
                    baseWordId_languageId_priority: {
                        baseWordId: baseWord.id,
                        languageId: translationLanguage.id,
                        priority,
                    },
                },
                update: {
                    translation,
                    partOfSpeechId: partOfSpeech.id,
                },
                create: {
                    baseWordId: baseWord.id,
                    languageId: translationLanguage.id,
                    translation,
                    priority: priority++,
                    partOfSpeechId: partOfSpeech.id,
                },
            });
        }
    }

    // Добавляем примеры
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

    return baseWord.id;
}

export async function addWordToGroup(
    baseWordId: number,
    wordGroupName: string,
) {
    const englishLanguage = await getOrCreateLanguage('en');
    const group = await prisma.wordGroup.findUnique({
        where: { name: wordGroupName },
    });

    if (!group) {
        throw new Error(`Word group '${wordGroupName}' not found`);
    }

    const existing = await prisma.baseWordOnWordGroup.findUnique({
        where: {
            baseWordId_wordGroupId: {
                baseWordId,
                wordGroupId: group.id,
            },
        },
    });

    if (!existing) {
        await prisma.baseWordOnWordGroup.create({
            data: {
                baseWordId,
                wordGroupId: group.id,
            },
        });
        return true;
    }

    return false;
}
