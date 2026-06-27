export function getWordIncludeForSetup(
    userId: number,
    translationLanguageCode: string,
) {
    return {
        status: true,
        language: {
            select: {
                code: true,
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
            take: 1,
            select: {
                translation: true,
            },
        },
    };
}
