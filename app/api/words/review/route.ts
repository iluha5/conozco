import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWordIncludeForTraining } from '@/lib/words/getWordIncludeForTraining';
import { getBaseWordIncludeForReview } from '@/lib/words/getBaseWordIncludeForReview';
import { selectWordIds } from '@/lib/words/selectWordIds';
import { fetchWordsByIds } from '@/lib/words/fetchWordsByIds';
import {
    resolveBaseWordIdsFromGroups,
    selectBaseWordIds,
} from '@/lib/words/selectBaseWordIds';
import { fetchBaseWordsByIds } from '@/lib/words/fetchBaseWordsByIds';
import {
    buildReviewWordsFromBase,
    serializeReviewWord,
    serializeUserReviewWord,
} from '@/lib/words/reviewWordFormat';

/**
 * GET /api/words/review - Universal endpoint for getting words by various criteria
 *
 * Query parameters:
 * - status: LEARNED | NOT_LEARNED (optional)
 * - limit: number of words (default 10, maximum 50)
 * - random: true | false (default true)
 * - selection: latest | random (optional; latest = random=false + createdAt desc)
 * - groupIds: array of group IDs separated by comma (optional)
 * - languageCode: language code for filtering (optional, defaults to user's learnLanguage)
 * - source: user | base (default 'user')
 * - includeAllGroups: true | false (default false, source=base only)
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

        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get('status');
        const limitParam = searchParams.get('limit');
        const randomParam = searchParams.get('random');
        const selectionParam = searchParams.get('selection');
        const groupIdsParam = searchParams.get('groupIds');
        const languageCodeParam = searchParams.get('languageCode');
        const sourceParam = searchParams.get('source') || 'user';
        const includeAllGroupsParam = searchParams.get('includeAllGroups');

        const languageCode =
            languageCodeParam || user.learnLanguage?.code || null;
        const translationLanguageCode = user.ownLanguage?.code || 'ru';

        const limit = Math.min(
            Math.max(parseInt(limitParam || '10') || 10, 1),
            50,
        );
        const random =
            selectionParam === 'latest' ? false : randomParam !== 'false';
        const source = sourceParam === 'base' ? 'base' : 'user';
        const includeAllGroups = includeAllGroupsParam === 'true';
        const groupIds = groupIdsParam
            ? groupIdsParam
                  .split(',')
                  .map(id => parseInt(id.trim()))
                  .filter(id => !isNaN(id))
            : null;

        if (source === 'base') {
            return handleBaseSourceReview({
                userId,
                languageCode,
                translationLanguageCode,
                limit,
                random,
                groupIds,
                includeAllGroups,
            });
        }

        return handleUserSourceReview({
            userId,
            languageCode,
            translationLanguageCode,
            statusParam,
            limit,
            random,
            groupIds,
        });
    } catch (error: any) {
        console.error('Error fetching review words:', error);
        console.error('Error details:', {
            message: error?.message,
            stack: error?.stack,
            name: error?.name,
        });
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

async function handleBaseSourceReview({
    userId,
    languageCode,
    translationLanguageCode,
    limit,
    random,
    groupIds,
    includeAllGroups,
}: {
    userId: number;
    languageCode: string | null;
    translationLanguageCode: string;
    limit: number;
    random: boolean;
    groupIds: number[] | null;
    includeAllGroups: boolean;
}) {
    let targetGroupIds: number[] = [];

    if (includeAllGroups) {
        const availableGroups = await prisma.wordGroup.findMany({
            where: {
                OR: [
                    { visibility: 'PUBLIC', isApproved: true },
                    {
                        visibility: 'SHARED',
                        sharedWith: { some: { userId } },
                    },
                    { createdByUserId: userId },
                ],
                ...(languageCode
                    ? {
                          language: { code: languageCode },
                      }
                    : {}),
            },
            select: { id: true },
        });
        targetGroupIds = availableGroups.map(group => group.id);
    } else if (groupIds && groupIds.length > 0) {
        const accessibleGroups = await prisma.wordGroup.findMany({
            where: {
                id: { in: groupIds },
                OR: [
                    { visibility: 'PUBLIC', isApproved: true },
                    {
                        visibility: 'SHARED',
                        sharedWith: { some: { userId } },
                    },
                    { createdByUserId: userId },
                ],
            },
            select: { id: true },
        });
        targetGroupIds = accessibleGroups.map(group => group.id);
    }

    if (targetGroupIds.length === 0) {
        return NextResponse.json([]);
    }

    const allBaseWordIds = await resolveBaseWordIdsFromGroups(targetGroupIds);

    if (allBaseWordIds.length === 0) {
        return NextResponse.json([]);
    }

    const selectedBaseWordIds = await selectBaseWordIds(allBaseWordIds, {
        limit,
        random,
        languageCode,
    });

    if (selectedBaseWordIds.length === 0) {
        return NextResponse.json([]);
    }

    const include = getBaseWordIncludeForReview(translationLanguageCode);
    const baseWords = await fetchBaseWordsByIds(
        selectedBaseWordIds,
        include,
        languageCode,
    );

    const userWords = await prisma.word.findMany({
        where: {
            userId,
            baseWordId: { in: selectedBaseWordIds },
        },
        select: {
            id: true,
            baseWordId: true,
            statusId: true,
        },
    });

    const userWordsMap = new Map(
        userWords.map(word => [word.baseWordId, word]),
    );

    const wordStatusNotLearned = await prisma.wordStatus.findFirst({
        where: { code: 'NOT_LEARNED' },
    });
    const wordStatusLearned = await prisma.wordStatus.findUnique({
        where: { code: 'LEARNED' },
    });

    const words = buildReviewWordsFromBase(baseWords, {
        userId,
        wordStatusNotLearnedId: wordStatusNotLearned?.id || 1,
        wordStatusLearnedId: wordStatusLearned?.id,
        userWordsMap,
    });

    const serializedWords = words.map(word => serializeReviewWord(word));

    return NextResponse.json(serializedWords);
}

async function handleUserSourceReview({
    userId,
    languageCode,
    translationLanguageCode,
    statusParam,
    limit,
    random,
    groupIds,
}: {
    userId: number;
    languageCode: string | null;
    translationLanguageCode: string;
    statusParam: string | null;
    limit: number;
    random: boolean;
    groupIds: number[] | null;
}) {
    const where: {
        userId: number;
        statusId?: number;
        languageId?: number;
        baseWordId?: { in: number[] };
    } = { userId };

    if (statusParam && ['LEARNED', 'NOT_LEARNED'].includes(statusParam)) {
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

    if (groupIds && groupIds.length > 0) {
        const baseWordIds = await resolveBaseWordIdsFromGroups(groupIds);

        if (baseWordIds.length > 0) {
            where.baseWordId = { in: baseWordIds };
        } else {
            return NextResponse.json([]);
        }
    }

    const selectedWordIds = await selectWordIds(where, { limit, random });

    if (selectedWordIds.length === 0) {
        return NextResponse.json([]);
    }

    const include = getWordIncludeForTraining(userId, translationLanguageCode);
    const words = await fetchWordsByIds(userId, selectedWordIds, include);
    const serializedWords = words.map(word =>
        serializeUserReviewWord(word, userId),
    );

    return NextResponse.json(serializedWords);
}
