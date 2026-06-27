import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { shuffleArray } from './shuffleArray';

interface SelectWordIdsOptions {
    limit: number;
    random: boolean;
}

export async function selectWordIds(
    where: Prisma.WordWhereInput,
    { limit, random }: SelectWordIdsOptions,
): Promise<number[]> {
    const idRows = await prisma.word.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: { id: true },
    });

    let selectedIds = idRows.map(row => row.id);

    if (random) {
        selectedIds = shuffleArray(selectedIds);
    }

    return selectedIds.slice(0, limit);
}
