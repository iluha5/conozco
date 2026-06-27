import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                learnLanguage: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User session expired. Please sign in again.' },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const languageCodeParam = searchParams.get('languageCode');
        const languageCode =
            languageCodeParam || user.learnLanguage?.code || null;

        const where: { userId: number; languageId?: number } = { userId };

        if (languageCode) {
            const language = await prisma.language.findUnique({
                where: { code: languageCode },
            });
            if (language) {
                where.languageId = language.id;
            }
        }

        const statusCounts = await prisma.word.groupBy({
            by: ['statusId'],
            where,
            _count: true,
        });

        const statuses = await prisma.wordStatus.findMany({
            select: { id: true, code: true },
        });

        const statusCodeById = new Map(
            statuses.map(status => [status.id, status.code]),
        );

        let notLearnedCount = 0;
        let learnedCount = 0;

        for (const entry of statusCounts) {
            const code = statusCodeById.get(entry.statusId);
            if (code === 'NOT_LEARNED') {
                notLearnedCount = entry._count;
            } else if (code === 'LEARNED') {
                learnedCount = entry._count;
            }
        }

        return NextResponse.json({
            notLearnedCount,
            learnedCount,
            totalCount: notLearnedCount + learnedCount,
        });
    } catch (error: any) {
        console.error('Error fetching training stats:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details:
                    process.env.NODE_ENV === 'development'
                        ? error?.message
                        : undefined,
            },
            { status: 500 },
        );
    }
}
