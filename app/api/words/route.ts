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
        const user = await prisma.user.findUnique({
            where: { id: parseInt(session.user.id) },
            include: {
                ownLanguage: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User session expired. Please sign in again.' },
                { status: 401 },
            );
        }

        // Determine translation language (user's ownLanguage)
        const translationLanguageCode = user.ownLanguage?.code || 'ru';

        const { searchParams } = new URL(request.url);
        const languageCode = searchParams.get('languageCode');
        const status = searchParams.get('status');

        const where: any = {
            userId: parseInt(session.user.id),
        };

        if (languageCode) {
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
                        translations: {
                            where: {
                                language: { code: translationLanguageCode },
                            },
                            orderBy: { priority: 'asc' },
                            include: {
                                partOfSpeech: true,
                            },
                        },
                        examples: {
                            where: {
                                translationLanguage: {
                                    code: translationLanguageCode,
                                },
                            },
                            include: {
                                pronoun: true,
                                sentenceType: true,
                                translationLanguage: true,
                            },
                        },
                        grammaticalExamples: {
                            where: {
                                translationLanguage: {
                                    code: translationLanguageCode,
                                },
                            },
                            include: {
                                pronoun: true,
                                tense: true,
                                sentenceType: true,
                            },
                        },
                        wordGroups: {
                            select: {
                                wordGroupId: true,
                            },
                        },
                    },
                },
                customTranslations: {
                    where: {
                        userId: parseInt(session.user.id),
                    },
                    include: {
                        partOfSpeech: true,
                        originalLanguage: true,
                        translationLanguage: true,
                    },
                    take: 1,
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
            const { status, baseWord, customTranslations, ...restWord } = word;

            return {
                ...restWord,
                status: status.code,
                baseWord: baseWord
                    ? {
                          ...baseWord,
                          examples: baseWord.examples.map((example: any) => ({
                              ...example,
                              sentenceType: example.sentenceType,
                              translationLanguage: example.translationLanguage
                                  ? {
                                        id: example.translationLanguage.id,
                                        code: example.translationLanguage.code,
                                        name: example.translationLanguage.name,
                                    }
                                  : null,
                          })),
                          grammaticalExamples: baseWord.grammaticalExamples.map(
                              (example: any) => ({
                                  ...example,
                                  sentenceType: example.sentenceType,
                              }),
                          ),
                      }
                    : undefined,
                customTranslations: Array.isArray(customTranslations)
                    ? customTranslations.map((ct: any) => ({
                          id: ct.id,
                          translation: ct.translation,
                          partOfSpeechId: ct.partOfSpeechId,
                          partOfSpeech: ct.partOfSpeech
                              ? {
                                    id: ct.partOfSpeech.id,
                                    name: ct.partOfSpeech.name,
                                }
                              : null,
                          originalLanguage: ct.originalLanguage
                              ? {
                                    id: ct.originalLanguage.id,
                                    code: ct.originalLanguage.code,
                                    name: ct.originalLanguage.name,
                                }
                              : null,
                          translationLanguage: ct.translationLanguage
                              ? {
                                    id: ct.translationLanguage.id,
                                    code: ct.translationLanguage.code,
                                    name: ct.translationLanguage.name,
                                }
                              : null,
                      }))
                    : [],
            };
        });

        return NextResponse.json(serializedWords);
    } catch (error: any) {
        console.error('Error fetching words:', error);
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

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }
        const user = await prisma.user.findUnique({
            where: { id: parseInt(session.user.id) },
            include: {
                ownLanguage: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User session expired. Please sign in again.' },
                { status: 401 },
            );
        }

        // Determine translation language (user's ownLanguage)
        const translationLanguageCode = user.ownLanguage?.code || 'ru';

        const { baseWordId } = await request.json();

        if (!baseWordId) {
            return NextResponse.json(
                { error: 'Base word ID is required' },
                { status: 400 },
            );
        }
        const baseWord = await prisma.baseWord.findUnique({
            where: { id: parseInt(baseWordId) },
            include: {
                language: true,
                translations: {
                    where: { language: { code: translationLanguageCode } },
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

        const word = await prisma.word.create({
            data: {
                userId: parseInt(session.user.id),
                baseWordId: baseWord.id,
                languageId: baseWord.languageId,
            },
            include: {
                status: true,
                language: true,
                baseWord: {
                    include: {
                        translations: {
                            where: {
                                language: { code: translationLanguageCode },
                            },
                            orderBy: { priority: 'asc' },
                            include: {
                                partOfSpeech: true,
                            },
                        },
                        examples: {
                            where: {
                                translationLanguage: {
                                    code: translationLanguageCode,
                                },
                            },
                            include: {
                                pronoun: true,
                                sentenceType: true,
                                translationLanguage: true,
                            },
                        },
                        grammaticalExamples: {
                            where: {
                                translationLanguage: {
                                    code: translationLanguageCode,
                                },
                            },
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
                          translationLanguage: example.translationLanguage
                              ? {
                                    id: example.translationLanguage.id,
                                    code: example.translationLanguage.code,
                                    name: example.translationLanguage.name,
                                }
                              : null,
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
