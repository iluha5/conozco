import { prisma } from '@/lib/prisma';
import { shuffleArray } from './shuffleArray';

interface SelectBaseWordIdsOptions {
    limit: number;
    random: boolean;
    languageCode?: string | null;
}

export async function selectBaseWordIds(
    baseWordIds: number[],
    { limit, random, languageCode }: SelectBaseWordIdsOptions,
): Promise<number[]> {
    if (baseWordIds.length === 0) {
        return [];
    }

    const idRows = await prisma.baseWord.findMany({
        where: {
            id: { in: baseWordIds },
            ...(languageCode
                ? {
                      language: { code: languageCode },
                  }
                : {}),
        },
        orderBy: { id: 'asc' },
        select: { id: true },
    });

    let selectedIds = idRows.map(row => row.id);

    if (random) {
        selectedIds = shuffleArray(selectedIds);
    }

    return selectedIds.slice(0, limit);
}

export async function resolveBaseWordIdsFromGroups(
    groupIds: number[],
): Promise<number[]> {
    if (groupIds.length === 0) {
        return [];
    }

    const baseWordsInGroups = await prisma.baseWordOnWordGroup.findMany({
        where: {
            wordGroupId: { in: groupIds },
        },
        select: {
            baseWordId: true,
        },
    });

    return Array.from(
        new Set(baseWordsInGroups.map(entry => entry.baseWordId)),
    );
}
