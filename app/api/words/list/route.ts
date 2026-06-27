import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWordIncludeForList } from '@/lib/words/getWordIncludeForList';
import { serializeWordListItem } from '@/lib/words/serializeWordListItem';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

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
 * GET /api/words/list - Paginated lightweight word list for /words page
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
        const statusParam = searchParams.get('status');
        const groupIdsParam = searchParams.get('groupIds');
        const limitParam = searchParams.get('limit');
        const offsetParam = searchParams.get('offset');

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
        const offset = Math.max(parseInt(offsetParam || '0', 10) || 0, 0);

        const where: {
            userId: number;
            statusId?: number;
            languageId?: number;
            baseWordId?: { in: number[] };
        } = { userId };

        if (
            statusParam &&
            statusParam !== 'ALL' &&
            ['LEARNED', 'NOT_LEARNED'].includes(statusParam)
        ) {
            const wordStatus = await prisma.wordStatus.findUnique({
                where: { code: statusParam },
            });
            if (wordStatus) {
                where.statusId = wordStatus.id;
            }
        }

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
                return NextResponse.json({
                    items: [],
                    totalCount: 0,
                    limit,
                    offset,
                    hasMore: false,
                });
            }

            where.baseWordId = { in: baseWordIds };
        }

        const include = getWordIncludeForList(userId, translationLanguageCode);

        const [totalCount, words] = await Promise.all([
            prisma.word.count({ where }),
            prisma.word.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: offset,
                take: limit,
                include,
            }),
        ]);

        const items = words.map(word => serializeWordListItem(word));

        return NextResponse.json({
            items,
            totalCount,
            limit,
            offset,
            hasMore: offset + items.length < totalCount,
        });
    } catch (error: any) {
        console.error('Error fetching words list:', error);
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
