import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublicWordGroupIds } from '@/lib/public-word-groups';

/**
 * GET /api/public/base-words
 * Guest read-only base words from public word groups.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const languageCode = searchParams.get('languageCode');
        const search = searchParams.get('search');
        const translationLanguageCode =
            searchParams.get('translationLanguageCode') || 'en';
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const wordGroupIdsParam = searchParams.get('wordGroupIds');

        if (!wordGroupIdsParam) {
            return NextResponse.json(
                { error: 'wordGroupIds is required' },
                { status: 400 },
            );
        }

        const requestedGroupIds = wordGroupIdsParam
            .split(',')
            .map(Number)
            .filter(id => !isNaN(id));

        const publicGroupIds = await getPublicWordGroupIds(requestedGroupIds);

        if (publicGroupIds.length === 0) {
            return NextResponse.json([]);
        }

        const where: {
            wordGroups: { some: { wordGroupId: { in: number[] } } };
            languageId?: number;
            OR?: Array<Record<string, unknown>>;
        } = {
            wordGroups: {
                some: {
                    wordGroupId: {
                        in: publicGroupIds,
                    },
                },
            },
        };

        if (languageCode) {
            const language = await prisma.language.findUnique({
                where: { code: languageCode },
            });

            if (language) {
                where.languageId = language.id;
            }
        }

        if (search) {
            where.OR = [
                { word: { contains: search, mode: 'insensitive' } },
                {
                    translations: {
                        some: {
                            translation: {
                                contains: search,
                                mode: 'insensitive',
                            },
                            language: { code: translationLanguageCode },
                        },
                    },
                },
            ];
        }

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
                    take: 3,
                },
                grammaticalExamples: {
                    where: {
                        translationLanguage: { code: translationLanguageCode },
                        tense: languageCode
                            ? { language: { code: languageCode } }
                            : undefined,
                    },
                    include: {
                        tense: true,
                        pronoun: true,
                        sentenceType: true,
                    },
                    take: 5,
                },
                wordGroups: {
                    select: {
                        wordGroupId: true,
                    },
                },
            },
        });

        const wordsWithStatus = baseWords.map(baseWord => ({
            ...baseWord,
            isAddedByUser: false,
            customTranslations: [],
        }));

        return NextResponse.json(wordsWithStatus);
    } catch (error) {
        console.error('Error fetching public base words:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
