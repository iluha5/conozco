import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - получить все доступные слова из базы данных
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        // Проверить, существует ли пользователь в базе данных
        const user = await prisma.user.findUnique({
            where: { id: parseInt(session.user.id) },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User session expired. Please sign in again.' },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const languageCode = searchParams.get('languageCode');
        const partOfSpeech = searchParams.get('partOfSpeech');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const where: any = {};

        if (languageCode) {
            // Получаем ID языка по коду
            const language = await prisma.language.findUnique({
                where: { code: languageCode },
            });
            if (language) {
                where.languageId = language.id;
            }
        }

        if (partOfSpeech) {
            where.partOfSpeech = partOfSpeech;
        }

        if (search) {
            where.word = {
                contains: search,
                mode: 'insensitive',
            };
        }

        // Получить базовые слова
        const baseWords = await prisma.baseWord.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: {
                word: 'asc',
            },
            include: {
                language: true,
                partOfSpeech: true,
                translations: {
                    where: { language: { code: 'ru' } },
                    orderBy: { priority: 'asc' },
                },
                examples: {
                    include: {
                        pronoun: true,
                        sentenceType: true,
                    },
                    take: 3, // Ограничим количество примеров
                },
                grammaticalExamples: {
                    where: {
                        tense: {
                            language: languageCode
                                ? { code: languageCode }
                                : undefined,
                        },
                    },
                    include: {
                        tense: true,
                        pronoun: true,
                        sentenceType: true,
                    },
                    take: 5, // Ограничим количество грамматических примеров
                },
            },
        });

        // Проверить, какие слова уже добавлены пользователем
        const userWordIds = await prisma.word.findMany({
            where: {
                userId: parseInt(session.user.id),
                baseWordId: {
                    in: baseWords.map(bw => bw.id),
                },
            },
            select: {
                baseWordId: true,
            },
        });

        const userBaseWordIds = new Set(userWordIds.map(uw => uw.baseWordId));

        // Добавить информацию о том, добавлено ли слово пользователем
        const wordsWithStatus = baseWords.map(baseWord => ({
            ...baseWord,
            isAddedByUser: userBaseWordIds.has(baseWord.id),
        }));

        return NextResponse.json(wordsWithStatus);
    } catch (error) {
        console.error('Error fetching base words:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
