import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/word-groups/[id]
 * Получить информацию о группе слов по ID
 * Используется для получения названий групп тестов, даже если они еще не активированы
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    if (isNaN(groupId)) {
        return NextResponse.json(
            { error: 'Invalid group ID' },
            { status: 400 },
        );
    }

    const userId = parseInt(session.user.id);

    // Получаем группу (публичные группы доступны всем, даже если не активированы)
    const group = await prisma.wordGroup.findFirst({
        where: {
            id: groupId,
            OR: [
                { visibility: 'PUBLIC', isApproved: true },
                {
                    visibility: 'SHARED',
                    sharedWith: { some: { userId } },
                },
                { createdByUserId: userId },
            ],
        },
        include: {
            createdBy: {
                select: { name: true, id: true },
            },
            _count: {
                select: { baseWords: true },
            },
            activeUsers: {
                where: { userId },
                select: { id: true },
            },
            language: {
                select: { id: true, code: true, name: true },
            },
        },
    });

    if (!group) {
        return NextResponse.json(
            { error: 'Group not found or not accessible' },
            { status: 404 },
        );
    }

    return NextResponse.json({
        id: group.id,
        name: group.name,
        wordsCount: group._count.baseWords,
        visibility: group.visibility,
        createdBy: group.createdBy.name,
        isOwner: group.createdByUserId === userId,
        isActive: group.activeUsers.length > 0,
        language: group.language,
    });
}

