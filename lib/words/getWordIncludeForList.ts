export function getWordIncludeForList(
    userId: number,
    translationLanguageCode: string,
) {
    return {
        status: true,
        language: {
            select: {
                code: true,
                name: true,
            },
        },
        baseWord: {
            select: {
                word: true,
                translations: {
                    where: {
                        language: { code: translationLanguageCode },
                    },
                    orderBy: { priority: 'asc' as const },
                    take: 1,
                    select: {
                        translation: true,
                        priority: true,
                        partOfSpeech: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        translations: {
                            where: {
                                language: { code: translationLanguageCode },
                            },
                        },
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
            take: 1,
            select: {
                translation: true,
                partOfSpeechId: true,
                partOfSpeech: {
                    select: {
                        name: true,
                    },
                },
            },
        },
    };
}
