export function getBaseWordIncludeForReview(translationLanguageCode: string) {
    return {
        language: true,
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
    };
}
