import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublicWordGroupIds } from '@/lib/public-word-groups';

function shuffleWords<T>(words: T[]): T[] {
    const shuffled = [...words];

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
 * GET /api/public/words/review
 * Guest read-only flashcard words from public base word groups.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const randomParam = searchParams.get('random');
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
        const random = randomParam !== 'false';

        const baseWordsInGroups = await prisma.baseWordOnWordGroup.findMany({
            where: {
                wordGroupId: { in: publicGroupIds },
            },
            select: {
                baseWordId: true,
            },
        });

        const baseWordIds = Array.from(
            new Set(baseWordsInGroups.map(entry => entry.baseWordId)),
        );

        if (baseWordIds.length === 0) {
            return NextResponse.json([]);
        }

        const baseWords = await prisma.baseWord.findMany({
            where: {
                id: { in: baseWordIds },
                language: { code: languageCode },
            },
            include: {
                language: true,
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
        });

        const wordStatusNotLearned = await prisma.wordStatus.findFirst({
            where: { code: 'NOT_LEARNED' },
        });

        let words = baseWords.map(baseWord => ({
            id: `base-${baseWord.id}`,
            userId: '0',
            baseWordId: baseWord.id.toString(),
            customWord: null,
            languageId: baseWord.languageId.toString(),
            language: {
                id: baseWord.language.id.toString(),
                code: baseWord.language.code,
                name: baseWord.language.name,
            },
            status: 'NOT_LEARNED',
            statusId: wordStatusNotLearned?.id || 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            belongsToUser: false,
            baseWord: {
                ...baseWord,
                id: baseWord.id.toString(),
                languageId: baseWord.languageId.toString(),
                examples: baseWord.examples.map(example => ({
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
                    example => ({
                        ...example,
                        sentenceType: example.sentenceType,
                    }),
                ),
            },
            customTranslations: [],
            trainingSessions: [],
        }));

        if (random && words.length > 0) {
            words = shuffleWords(words);
        }

        words = words.slice(0, limit);

        const serializedWords = words.map(word => {
            const {
                status,
                baseWord,
                customTranslations: _customTranslations,
                ...restWord
            } = word;

            return {
                ...restWord,
                status,
                baseWord: baseWord
                    ? {
                          ...baseWord,
                          examples: baseWord.examples.map(example => ({
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
                              example => ({
                                  ...example,
                                  sentenceType: example.sentenceType,
                              }),
                          ),
                      }
                    : undefined,
                customTranslations: [],
            };
        });

        return NextResponse.json(serializedWords);
    } catch (error) {
        console.error('Error fetching public review words:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
