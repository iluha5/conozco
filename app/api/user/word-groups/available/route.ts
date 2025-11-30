import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Получаем язык обучения пользователя
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { learnLanguageId: true },
    });

    const whereClause: any = {
        OR: [
            { visibility: 'PUBLIC', isApproved: true },
            {
                visibility: 'SHARED',
                sharedWith: { some: { userId } },
            },
        ],
        NOT: {
            activeUsers: { some: { userId } },
        },
    };

    // Фильтруем по языку обучения пользователя, если он установлен
    if (user?.learnLanguageId) {
        whereClause.languageId = user.learnLanguageId;
    }

    const availableGroups = await prisma.wordGroup.findMany({
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

    return NextResponse.json(
        availableGroups.map(g => ({
            id: g.id,
            name: g.name,
            wordsCount: g._count.baseWords,
            visibility: g.visibility,
            createdBy: g.createdBy.name,
            isOwner: g.createdByUserId === userId,
        })),
    );
}
