import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { tServer } from '@/lib/i18n/utils/tServer';

/**
 * PATCH /api/words/bulk - Массовое обновление статуса слов
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

        // Проверить, существует ли пользователь в базе данных
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

        // Получаем ID статуса
        const wordStatus = await prisma.wordStatus.findUnique({
            where: { code: status },
        });

        if (!wordStatus) {
            return NextResponse.json(
                { error: await tServer('Invalid status') },
                { status: 400 },
            );
        }

        // Массовое обновление - только слова текущего пользователя
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
 * DELETE /api/words/bulk - Массовое удаление слов
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

        // Проверить, существует ли пользователь в базе данных
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

        // Сначала удаляем связанные customTranslations
        await prisma.customTranslation.deleteMany({
            where: {
                wordId: {
                    in: wordIds.map((id: string | number) => Number(id)),
                },
                userId: userId,
            },
        });

        // Массовое удаление - только слова текущего пользователя
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







