import 'server-only';

import { prisma } from '@/lib/prisma';
import type { TranslationResult } from '@/lib/translation-api';
import { getBaseWordDetailInclude } from '@/lib/words/getBaseWordDetailInclude';

type CreateBaseWordFromExternalParams = {
    trimmedWord: string;
    languageId: number;
    translationLanguageCode: string;
    wordData: TranslationResult;
};

export async function createBaseWordFromExternal({
    trimmedWord,
    languageId,
    translationLanguageCode,
    wordData,
}: CreateBaseWordFromExternalParams) {
    const deeplSource = await prisma.wordSource.findUnique({
        where: { code: 'DEEPL' },
    });

    const myMemorySource = await prisma.wordSource.findUnique({
        where: { code: 'MYMEMORY' },
    });

    const tatoebaSource = await prisma.wordSource.findUnique({
        where: { code: 'TATOEBA' },
    });

    if (!deeplSource || !myMemorySource || !tatoebaSource) {
        throw new Error('Required word sources not found in database');
    }

    const wordSourceId =
        wordData.source === 'DEEPL' ? deeplSource.id : myMemorySource.id;

    return prisma.$transaction(async tx => {
        const baseWord = await tx.baseWord.create({
            data: {
                word: trimmedWord,
                language: {
                    connect: { id: languageId },
                },
                source: {
                    connect: { id: wordSourceId },
                },
            },
        });

        const targetLanguage = await tx.language.findUnique({
            where: { code: translationLanguageCode },
        });

        if (!targetLanguage) {
            throw new Error(
                `Target language (${translationLanguageCode}) not found`,
            );
        }

        const existingTranslations = await tx.wordTranslation.findMany({
            where: {
                baseWordId: baseWord.id,
                languageId: targetLanguage.id,
            },
        });

        if (existingTranslations.length === 0) {
            await tx.wordTranslation.create({
                data: {
                    baseWordId: baseWord.id,
                    languageId: targetLanguage.id,
                    translation: wordData.mainTranslation,
                    priority: 1,
                },
            });

            for (
                let index = 0;
                index < wordData.alternativeTranslations.length && index < 2;
                index++
            ) {
                const alternative = wordData.alternativeTranslations[index];
                if (alternative && alternative !== wordData.mainTranslation) {
                    await tx.wordTranslation.create({
                        data: {
                            baseWordId: baseWord.id,
                            languageId: targetLanguage.id,
                            translation: alternative,
                            priority: index + 2,
                        },
                    });
                }
            }
        }

        if (wordData.examples.length > 0) {
            const existingExamples = await tx.wordExample.findMany({
                where: { baseWordId: baseWord.id },
            });

            if (existingExamples.length === 0) {
                const defaultPronoun = await tx.pronoun.findFirst({
                    where: { languageId },
                });

                const defaultSentenceType = await tx.sentenceType.findFirst({
                    where: {
                        isNegative: false,
                        isQuestion: false,
                    },
                });

                if (defaultPronoun && defaultSentenceType) {
                    for (
                        let index = 0;
                        index < Math.min(5, wordData.examples.length);
                        index++
                    ) {
                        const example = wordData.examples[index];
                        await tx.wordExample.create({
                            data: {
                                baseWordId: baseWord.id,
                                pronounId: defaultPronoun.id,
                                example: example.sentence,
                                translation: example.translation,
                                translationLanguageId: targetLanguage.id,
                                sentenceTypeId: defaultSentenceType.id,
                                sourceId: tatoebaSource.id,
                            },
                        });
                    }
                }
            }
        }

        const completeBaseWord = await tx.baseWord.findUnique({
            where: { id: baseWord.id },
            include: getBaseWordDetailInclude(translationLanguageCode),
        });

        if (!completeBaseWord) {
            throw new Error('Failed to load created base word');
        }

        return completeBaseWord;
    });
}

export async function findBaseWordByExactMatch(
    trimmedWord: string,
    languageId: number,
    translationLanguageCode: string,
) {
    return prisma.baseWord.findUnique({
        where: {
            word_languageId: {
                word: trimmedWord,
                languageId,
            },
        },
        include: getBaseWordDetailInclude(translationLanguageCode),
    });
}
