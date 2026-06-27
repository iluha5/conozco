import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWordIncludeForTraining } from '@/lib/words/getWordIncludeForTraining';
import { serializeWord } from '@/lib/words/serializeWord';

const MAX_WORDS = 50;

function parseWordIds(wordIdsParam: string | null): number[] {
    if (!wordIdsParam) {
        return [];
    }

    return wordIdsParam
        .split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id))
        .slice(0, MAX_WORDS);
}

function shuffleArray<T>(items: T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [
            shuffled[randomIndex],
            shuffled[index],
        ];
    }
    return shuffled;
}

/**
 * GET /api/training/words
 *
 * Modes:
 * - By IDs: ?wordIds=1,2,3
 * - Server selection: ?limit=10&status=NOT_LEARNED&selection=latest|random&languageCode=en
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

        const wordIds = parseWordIds(searchParams.get('wordIds'));
        const include = getWordIncludeForTraining(
            userId,
            translationLanguageCode,
        );

        let targetWordIds: number[];

        if (wordIds.length > 0) {
            targetWordIds = wordIds;
        } else {
            const statusParam = searchParams.get('status');
            const limitParam = searchParams.get('limit');
            const selectionParam = searchParams.get('selection') || 'latest';
            const languageCodeParam = searchParams.get('languageCode');
            const languageCode =
                languageCodeParam || user.learnLanguage?.code || null;

            const limit = Math.min(
                Math.max(parseInt(limitParam || '10', 10) || 10, 1),
                MAX_WORDS,
            );
            const selection = selectionParam === 'random' ? 'random' : 'latest';

            const where: {
                userId: number;
                statusId?: number;
                languageId?: number;
            } = { userId };

            if (
                statusParam &&
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

            const idRows = await prisma.word.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                select: { id: true },
            });

            let selectedIds = idRows.map(row => row.id);

            if (selection === 'random') {
                selectedIds = shuffleArray(selectedIds);
            }

            targetWordIds = selectedIds.slice(0, limit);
        }

        if (targetWordIds.length === 0) {
            return NextResponse.json([]);
        }

        const words = await prisma.word.findMany({
            where: {
                userId,
                id: { in: targetWordIds },
            },
            include,
        });

        const wordsById = new Map(words.map(word => [word.id, word]));
        const orderedWords = targetWordIds
            .map(id => wordsById.get(id))
            .filter((word): word is NonNullable<typeof word> => word != null);

        const serializedWords = orderedWords.map(word => serializeWord(word));

        return NextResponse.json(serializedWords);
    } catch (error: any) {
        console.error('Error fetching training words:', error);
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
