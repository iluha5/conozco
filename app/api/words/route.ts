import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - получить все слова текущего пользователя
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
        const status = searchParams.get('status');

        const where: any = {
            userId: parseInt(session.user.id),
        };

        if (languageCode) {
            // Получаем ID языка по коду
            const language = await prisma.language.findUnique({
                where: { code: languageCode },
            });
            if (language) {
                where.languageId = language.id;
            }
        }
        if (status) {
            where.status = {
                code: status,
            };
        }

        const words = await prisma.word.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                status: true,
                language: true,
                baseWord: {
                    include: {
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
                        },
                        grammaticalExamples: {
                            include: {
                                pronoun: true,
                                tense: true,
                                sentenceType: true,
                            },
                        },
                    },
                },
                trainingSessions: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 5,
                },
            },
        });

        const serializedWords = words.map((word: any) => {
            const { status, baseWord, ...restWord } = word;

            return {
                ...restWord,
                status: status.code,
                baseWord: baseWord
                    ? {
                          ...baseWord,
                          examples: baseWord.examples.map((example: any) => ({
                              ...example,
                              sentenceType: example.sentenceType,
                          })),
                          grammaticalExamples: baseWord.grammaticalExamples.map(
                              (example: any) => ({
                                  ...example,
                                  sentenceType: example.sentenceType,
                              }),
                          ),
                      }
                    : undefined,
            };
        });

        return NextResponse.json(serializedWords);
    } catch (error) {
        console.error('Error fetching words:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}

// POST - добавить слово из базы данных
export async function POST(request: NextRequest) {
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

        const { baseWordId, customTranslation } = await request.json();

        if (!baseWordId) {
            return NextResponse.json(
                { error: 'Base word ID is required' },
                { status: 400 },
            );
        }

        // Проверить, существует ли базовое слово
        const baseWord = await prisma.baseWord.findUnique({
            where: { id: parseInt(baseWordId) },
            include: {
                language: true,
                partOfSpeech: true,
                translations: {
                    where: { language: { code: 'ru' } },
                    orderBy: { priority: 'asc' },
                    take: 1,
                },
            },
        });

        if (!baseWord) {
            return NextResponse.json(
                { error: 'Word not found in database' },
                { status: 404 },
            );
        }

        // Проверить, не добавил ли пользователь уже это слово
        const existingWord = await prisma.word.findUnique({
            where: {
                userId_baseWordId: {
                    userId: parseInt(session.user.id),
                    baseWordId: baseWord.id,
                },
            },
        });

        if (existingWord) {
            return NextResponse.json(
                { error: 'You already have this word in your vocabulary' },
                { status: 409 },
            );
        }

        // Создать слово для пользователя
        const word = await prisma.word.create({
            data: {
                userId: parseInt(session.user.id),
                baseWordId: baseWord.id,
                customTranslation: customTranslation?.trim() || null,
                languageId: baseWord.languageId,
            },
            include: {
                status: true,
                language: true,
                baseWord: {
                    include: {
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
                        },
                        grammaticalExamples: {
                            include: {
                                pronoun: true,
                                tense: true,
                                sentenceType: true,
                            },
                        },
                    },
                },
            },
        });

        const { status, ...rest } = word as any;
        const normalized = {
            ...rest,
            status: status.code,
            baseWord: rest.baseWord
                ? {
                      ...rest.baseWord,
                      examples: rest.baseWord.examples.map((example: any) => ({
                          ...example,
                          sentenceType: example.sentenceType,
                      })),
                      grammaticalExamples:
                          rest.baseWord.grammaticalExamples.map(
                              (example: any) => ({
                                  ...example,
                                  sentenceType: example.sentenceType,
                              }),
                          ),
                  }
                : undefined,
        };

        return NextResponse.json(normalized, { status: 201 });
    } catch (error: any) {
        console.error('Error creating word:', error);

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
