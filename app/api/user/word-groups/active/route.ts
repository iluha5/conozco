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

    // Get user's learning language
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { learnLanguageId: true },
    });

    const activeGroups = await prisma.userWordGroup.findMany({
        where: { userId },
        include: {
            wordGroup: {
                include: {
                    _count: {
                        select: { baseWords: true },
                    },
                    language: true,
                },
            },
        },
        orderBy: { activatedAt: 'desc' },
    });

    // Filter groups by user's learning language if set
    const filteredGroups = user?.learnLanguageId
        ? activeGroups.filter(
              ag => ag.wordGroup.languageId === user.learnLanguageId,
          )
        : activeGroups;

    return NextResponse.json(
        filteredGroups.map(ag => ({
            id: ag.wordGroup.id,
            name: ag.wordGroup.name,
            wordsCount: ag.wordGroup._count.baseWords,
            visibility: ag.wordGroup.visibility,
            isOwner: ag.wordGroup.createdByUserId === userId,
            canRemove: true,
            activatedAt: ag.activatedAt,
        })),
    );
}
