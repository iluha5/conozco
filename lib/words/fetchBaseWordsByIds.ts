import { prisma } from '@/lib/prisma';
import { getBaseWordIncludeForReview } from './getBaseWordIncludeForReview';

type BaseWordReviewInclude = ReturnType<typeof getBaseWordIncludeForReview>;

export async function fetchBaseWordsByIds(
    baseWordIds: number[],
    include: BaseWordReviewInclude,
    languageCode?: string | null,
) {
    if (baseWordIds.length === 0) {
        return [];
    }

    const baseWords = await prisma.baseWord.findMany({
        where: {
            id: { in: baseWordIds },
            ...(languageCode
                ? {
                      language: { code: languageCode },
                  }
                : {}),
        },
        include,
    });

    const baseWordsById = new Map(baseWords.map(word => [word.id, word]));

    return baseWordIds
        .map(id => baseWordsById.get(id))
        .filter((word): word is NonNullable<typeof word> => word != null);
}
