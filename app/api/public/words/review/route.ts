import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublicWordGroupIds } from '@/lib/public-word-groups';
import { getBaseWordIncludeForReview } from '@/lib/words/getBaseWordIncludeForReview';
import {
    resolveBaseWordIdsFromGroups,
    selectBaseWordIds,
} from '@/lib/words/selectBaseWordIds';
import { fetchBaseWordsByIds } from '@/lib/words/fetchBaseWordsByIds';
import {
    buildReviewWordsFromBase,
    serializeReviewWord,
} from '@/lib/words/reviewWordFormat';

/**
 * GET /api/public/words/review
 * Guest read-only flashcard words from public base word groups.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const randomParam = searchParams.get('random');
        const selectionParam = searchParams.get('selection');
        const groupIdsParam = searchParams.get('groupIds');
        const languageCode = searchParams.get('languageCode');
        const translationLanguageCode =
            searchParams.get('translationLanguageCode') || 'en';

        if (!languageCode) {
            return NextResponse.json(
                { error: 'languageCode is required' },
                { status: 400 },
            );
        }

        const groupIds = groupIdsParam
            ? groupIdsParam
                  .split(',')
                  .map(id => parseInt(id.trim()))
                  .filter(id => !isNaN(id))
            : [];

        if (groupIds.length === 0) {
            return NextResponse.json([]);
        }

        const publicGroupIds = await getPublicWordGroupIds(groupIds);

        if (publicGroupIds.length === 0) {
            return NextResponse.json([]);
        }

        const limit = Math.min(
            Math.max(parseInt(limitParam || '10') || 10, 1),
            50,
        );
        const random =
            selectionParam === 'latest' ? false : randomParam !== 'false';

        const allBaseWordIds =
            await resolveBaseWordIdsFromGroups(publicGroupIds);

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

        const wordStatusNotLearned = await prisma.wordStatus.findFirst({
            where: { code: 'NOT_LEARNED' },
        });

        const words = buildReviewWordsFromBase(baseWords, {
            userId: 0,
            wordStatusNotLearnedId: wordStatusNotLearned?.id || 1,
            userWordsMap: new Map(),
            belongsToUserDefault: false,
        });

        const serializedWords = words.map(word => serializeReviewWord(word));

        return NextResponse.json(serializedWords);
    } catch (error) {
        console.error('Error fetching public review words:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
