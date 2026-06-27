import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function fetchWordsByIds<T extends Prisma.WordInclude>(
    userId: number,
    wordIds: number[],
    include: T,
): Promise<Prisma.WordGetPayload<{ include: T }>[]> {
    if (wordIds.length === 0) {
        return [];
    }

    const words = await prisma.word.findMany({
        where: {
            userId,
            id: { in: wordIds },
        },
        include,
    });

    const wordsById = new Map(words.map(word => [word.id, word]));

    return wordIds
        .map(id => wordsById.get(id))
        .filter((word): word is NonNullable<typeof word> => word != null);
}
