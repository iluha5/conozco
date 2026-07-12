import type { Prisma } from '@prisma/client';

export function getBaseWordDetailInclude(
    translationLanguageCode: string,
): Prisma.BaseWordInclude {
    return {
        language: true,
        translations: {
            where: { language: { code: translationLanguageCode } },
            orderBy: { priority: 'asc' },
            include: {
                partOfSpeech: true,
            },
        },
        examples: {
            where: {
                translationLanguage: { code: translationLanguageCode },
            },
            include: {
                pronoun: true,
                sentenceType: true,
                translationLanguage: true,
            },
        },
        grammaticalExamples: {
            where: {
                translationLanguage: { code: translationLanguageCode },
            },
            include: {
                pronoun: true,
                tense: true,
                sentenceType: true,
            },
        },
    };
}
