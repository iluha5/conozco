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

        const { searchParams } = new URL(request.url);
        const languageCode = searchParams.get('languageCode');
        const partOfSpeech = searchParams.get('partOfSpeech');
        const search = searchParams.get('search');
        const translationLanguageCodeParam = searchParams.get(
            'translationLanguageCode',
        );
        // Determine translation language (priority to param, then user ownLanguage)
        const translationLanguageCode =
            translationLanguageCodeParam || user.ownLanguage?.code || 'ru';
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const wordGroupIdsParam = searchParams.get('wordGroupIds');

        const where: any = {};

        if (languageCode) {
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

        // Search by word in learning language and/or translation in native language
        if (search) {
            const searchConditions: any[] = [
                { word: { contains: search, mode: 'insensitive' } },
            ];

            // Add search by translations in user native language
            if (translationLanguageCode) {
                searchConditions.push({
                    translations: {
                        some: {
                            translation: {
                                contains: search,
                                mode: 'insensitive',
                            },
                            language: { code: translationLanguageCode },
                        },
                    },
                });
            }

            where.OR = searchConditions;
        }

        // Filter by word groups
        if (wordGroupIdsParam) {
            const wordGroupIds = wordGroupIdsParam.split(',').map(Number);
            if (wordGroupIds.length > 0) {
                where.wordGroups = {
                    some: {
                        wordGroupId: {
                            in: wordGroupIds,
                        },
                    },
                };
            }
        }

        // Get base words
        const baseWords = await prisma.baseWord.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: {
                word: 'asc',
            },
            include: {
                language: true,
                translations: {
                    where: { language: { code: translationLanguageCode } },
                    orderBy: { priority: 'asc' },
                    include: {
                        partOfSpeech: true,
                    },
                },
                examples: {
                    where: {
                        translationLanguage: { code: translationLanguageCode },
                    },
                    include: {
                        pronoun: true,
                        sentenceType: true,
                        translationLanguage: true,
                    },
                    take: 3, // Limit examples quantity
                },
                grammaticalExamples: {
                    where: {
                        translationLanguage: { code: translationLanguageCode },
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
                    take: 5, // Limit grammatical examples quantity
                },
                wordGroups: {
                    select: {
                        wordGroupId: true,
                    },
                },
            },
        });

        // Check which words are already added by user
        const userWords = await prisma.word.findMany({
            where: {
                userId: parseInt(session.user.id),
                baseWordId: {
                    in: baseWords.map(bw => bw.id),
                },
            },
            select: {
                baseWordId: true,
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
            },
        });

        const userWordMap = new Map(userWords.map(uw => [uw.baseWordId, uw]));

        // Add information about whether word is added by user
        const wordsWithStatus = baseWords.map(baseWord => {
            const userWord = userWordMap.get(baseWord.id);
            return {
                ...baseWord,
                isAddedByUser: !!userWord,
                customTranslations: userWord?.customTranslations || [],
            };
        });

        return NextResponse.json(wordsWithStatus);
    } catch (error) {
        console.error('Error fetching base words:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
