export function getWordIncludeForTraining(
    userId: number,
    translationLanguageCode: string,
) {
    return {
        status: true,
        language: true,
        baseWord: {
            include: {
                translations: {
                    where: {
                        language: { code: translationLanguageCode },
                    },
                    orderBy: { priority: 'asc' as const },
                    include: {
                        partOfSpeech: true,
                    },
                },
                examples: {
                    where: {
                        translationLanguage: {
                            code: translationLanguageCode,
                        },
                    },
                    include: {
                        pronoun: true,
                        sentenceType: true,
                        translationLanguage: true,
                    },
                },
                grammaticalExamples: {
                    where: {
                        translationLanguage: {
                            code: translationLanguageCode,
                        },
                    },
                    include: {
                        pronoun: true,
                        tense: true,
                        sentenceType: true,
                    },
                },
                wordGroups: {
                    select: {
                        wordGroupId: true,
                    },
                },
            },
        },
        customTranslations: {
            where: {
                userId,
                translationLanguage: {
                    code: translationLanguageCode,
                },
            },
            include: {
                partOfSpeech: true,
                originalLanguage: true,
                translationLanguage: true,
            },
            take: 1,
        },
    };
}
