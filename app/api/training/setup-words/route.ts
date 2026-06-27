import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWordIncludeForSetup } from '@/lib/words/getWordIncludeForSetup';
import { serializeSetupWord } from '@/lib/words/serializeSetupWord';

const DEFAULT_LIMIT = 120;
const MAX_LIMIT = 200;

function parseGroupIds(groupIdsParam: string | null): number[] | null {
    if (!groupIdsParam) {
        return null;
    }

    const ids = groupIdsParam
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id));

    return ids.length > 0 ? ids : null;
}

/**
 * GET /api/training/setup-words
 * Lightweight word list for /training/setup page.
 */
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
                ownLanguage: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User session expired. Please sign in again.' },
                { status: 401 },
            );
        }

        const translationLanguageCode = user.ownLanguage?.code || 'ru';
        const { searchParams } = new URL(request.url);
        const languageCodeParam = searchParams.get('languageCode');
        const groupIdsParam = searchParams.get('groupIds');
        const limitParam = searchParams.get('limit');

        const languageCode =
            languageCodeParam || user.learnLanguage?.code || null;
        const groupIds = parseGroupIds(groupIdsParam);
        const limit = Math.min(
            Math.max(
                parseInt(limitParam || String(DEFAULT_LIMIT), 10) ||
                    DEFAULT_LIMIT,
                1,
            ),
            MAX_LIMIT,
        );

        const notLearnedStatus = await prisma.wordStatus.findUnique({
            where: { code: 'NOT_LEARNED' },
        });

        if (!notLearnedStatus) {
            return NextResponse.json([]);
        }

        const where: {
            userId: number;
            statusId: number;
            languageId?: number;
            baseWordId?: { in: number[] };
        } = {
            userId,
            statusId: notLearnedStatus.id,
        };

        if (languageCode) {
            const language = await prisma.language.findUnique({
                where: { code: languageCode },
            });
            if (language) {
                where.languageId = language.id;
            }
        }

        if (groupIds) {
            const baseWordsInGroups = await prisma.baseWordOnWordGroup.findMany(
                {
                    where: {
                        wordGroupId: { in: groupIds },
                    },
                    select: {
                        baseWordId: true,
                    },
                },
            );

            const baseWordIds = baseWordsInGroups.map(bw => bw.baseWordId);

            if (baseWordIds.length === 0) {
                return NextResponse.json([]);
            }

            where.baseWordId = { in: baseWordIds };
        }

        const include = getWordIncludeForSetup(userId, translationLanguageCode);

        const words = await prisma.word.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include,
        });

        const serializedWords = words.map(word => serializeSetupWord(word));

        return NextResponse.json(serializedWords);
    } catch (error: any) {
        console.error('Error fetching setup words:', error);
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
