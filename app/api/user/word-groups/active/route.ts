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

    const activeGroups = await prisma.userWordGroup.findMany({
        where: { userId },
        include: {
            wordGroup: {
                include: {
                    _count: {
                        select: { baseWords: true },
                    },
                },
            },
        },
        orderBy: { activatedAt: 'desc' },
    });

    return NextResponse.json(
        activeGroups.map(ag => ({
            id: ag.wordGroup.id,
            name: ag.wordGroup.name,
            wordsCount: ag.wordGroup._count.baseWords,
            visibility: ag.wordGroup.visibility,
            isOwner: ag.wordGroup.createdByUserId === userId,
            canRemove: ag.wordGroup.createdByUserId !== userId,
            activatedAt: ag.activatedAt,
        })),
    );
}
