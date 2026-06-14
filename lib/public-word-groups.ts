import { prisma } from '@/lib/prisma';

export async function getPublicWordGroupIds(
    groupIds: number[],
): Promise<number[]> {
    if (groupIds.length === 0) {
        return [];
    }

    const groups = await prisma.wordGroup.findMany({
        where: {
            id: { in: groupIds },
            visibility: 'PUBLIC',
            isApproved: true,
        },
        select: { id: true },
    });

    return groups.map(group => group.id);
}

export async function fetchPublicWordGroups(languageCode?: string | null) {
    const whereClause: {
        visibility: 'PUBLIC';
        isApproved: true;
        language?: { code: string };
    } = {
        visibility: 'PUBLIC',
        isApproved: true,
    };

    if (languageCode) {
        whereClause.language = { code: languageCode };
    }

    const groups = await prisma.wordGroup.findMany({
        where: whereClause,
        include: {
            createdBy: {
                select: { name: true, id: true },
            },
            _count: {
                select: { baseWords: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return groups.map(group => ({
        id: group.id,
        name: group.name,
        wordsCount: group._count.baseWords,
        visibility: group.visibility,
        createdBy: group.createdBy.name,
        isOwner: false,
        isActive: false,
        canRemove: false,
    }));
}
