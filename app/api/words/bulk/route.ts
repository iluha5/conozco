import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tServer } from '@/lib/i18n/server';
import { getWordIncludeForList } from '@/lib/words/getWordIncludeForList';
import { serializeWordListItem } from '@/lib/words/serializeWordListItem';

const MAX_BULK_SIZE = 200;

function parseIdArray(values: unknown): { ids: number[] } | { error: string } {
    if (!values || !Array.isArray(values) || values.length === 0) {
        return { error: 'Array is required' };
    }

    const ids = Array.from(
        new Set(
            values
                .map((value: string | number) => Number(value))
                .filter(id => !Number.isNaN(id)),
        ),
    );

    if (ids.length === 0) {
        return { error: 'Array is required' };
    }

    if (ids.length > MAX_BULK_SIZE) {
        return { error: `Maximum ${MAX_BULK_SIZE} items allowed` };
    }

    return { ids };
}

/**
 * POST /api/words/bulk - Bulk add words from dictionary by baseWordIds
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: await tServer('Unauthorized') },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                ownLanguage: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    error: await tServer(
                        'User session expired. Please sign in again.',
                    ),
                },
                { status: 401 },
            );
        }

        const translationLanguageCode = user.ownLanguage?.code || 'ru';
        const { baseWordIds } = await request.json();
        const parsed = parseIdArray(baseWordIds);

        if ('error' in parsed) {
            return NextResponse.json(
                { error: await tServer('baseWordIds array is required') },
                { status: 400 },
            );
        }

        const result = await prisma.$transaction(async tx => {
            const baseWords = await tx.baseWord.findMany({
                where: { id: { in: parsed.ids } },
                select: {
                    id: true,
                    languageId: true,
                },
            });

            const validBaseWordIds = new Set(
                baseWords.map(baseWord => baseWord.id),
            );

            const existingWords = await tx.word.findMany({
                where: {
                    userId,
                    baseWordId: { in: Array.from(validBaseWordIds) },
                },
                select: { baseWordId: true },
            });

            const existingBaseWordIds = new Set(
                existingWords
                    .map(word => word.baseWordId)
                    .filter((id): id is number => id !== null),
            );

            const baseWordsToCreate = baseWords.filter(
                baseWord => !existingBaseWordIds.has(baseWord.id),
            );

            if (baseWordsToCreate.length > 0) {
                await tx.word.createMany({
                    data: baseWordsToCreate.map(baseWord => ({
                        userId,
                        baseWordId: baseWord.id,
                        languageId: baseWord.languageId,
                    })),
                    skipDuplicates: true,
                });
            }

            const createdBaseWordIds = baseWordsToCreate.map(
                baseWord => baseWord.id,
            );

            const listInclude = getWordIncludeForList(
                userId,
                translationLanguageCode,
            );

            const words =
                createdBaseWordIds.length > 0
                    ? await tx.word.findMany({
                          where: {
                              userId,
                              baseWordId: { in: createdBaseWordIds },
                          },
                          include: listInclude,
                      })
                    : [];

            const skipped = parsed.ids.filter(
                id => !validBaseWordIds.has(id) || existingBaseWordIds.has(id),
            ).length;

            return {
                created: words.length,
                skipped,
                items: words.map(word => serializeWordListItem(word)),
            };
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('Error bulk adding words:', error);

        return NextResponse.json(
            { error: await tServer('Internal server error') },
            { status: 500 },
        );
    }
}

/**
 * PATCH /api/words/bulk - Bulk update word status
 */
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: await tServer('Unauthorized') },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                {
                    error: await tServer(
                        'User session expired. Please sign in again.',
                    ),
                },
                { status: 401 },
            );
        }

        const { wordIds, status } = await request.json();

        if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
            return NextResponse.json(
                { error: await tServer('wordIds array is required') },
                { status: 400 },
            );
        }

        if (!status || !['LEARNED', 'NOT_LEARNED'].includes(status)) {
            return NextResponse.json(
                {
                    error: await tServer(
                        'Valid status (LEARNED or NOT_LEARNED) is required',
                    ),
                },
                { status: 400 },
            );
        }

        const wordStatus = await prisma.wordStatus.findUnique({
            where: { code: status },
        });

        if (!wordStatus) {
            return NextResponse.json(
                { error: await tServer('Invalid status') },
                { status: 400 },
            );
        }

        // Bulk update - only current user's words
        const result = await prisma.word.updateMany({
            where: {
                id: { in: wordIds.map((id: string | number) => Number(id)) },
                userId: userId,
            },
            data: {
                statusId: wordStatus.id,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            updated: result.count,
            status: status,
        });
    } catch (error) {
        console.error('Error bulk updating words:', error);

        return NextResponse.json(
            { error: await tServer('Internal server error') },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/words/bulk - Bulk delete words
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: await tServer('Unauthorized') },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                {
                    error: await tServer(
                        'User session expired. Please sign in again.',
                    ),
                },
                { status: 401 },
            );
        }

        const { wordIds } = await request.json();

        if (!wordIds || !Array.isArray(wordIds) || wordIds.length === 0) {
            return NextResponse.json(
                { error: await tServer('wordIds array is required') },
                { status: 400 },
            );
        }

        // First delete related customTranslations
        await prisma.customTranslation.deleteMany({
            where: {
                wordId: {
                    in: wordIds.map((id: string | number) => Number(id)),
                },
                userId: userId,
            },
        });

        // Bulk delete - only current user's words
        const result = await prisma.word.deleteMany({
            where: {
                id: { in: wordIds.map((id: string | number) => Number(id)) },
                userId: userId,
            },
        });

        return NextResponse.json({
            deleted: result.count,
        });
    } catch (error) {
        console.error('Error bulk deleting words:', error);

        return NextResponse.json(
            { error: await tServer('Internal server error') },
            { status: 500 },
        );
    }
}
