import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/words/review - Universal endpoint for getting words by various criteria
 *
 * Query parameters:
 * - status: LEARNED | NOT_LEARNED (optional)
 * - limit: number of words (default 10, maximum 50)
 * - random: true | false (default true)
 * - groupIds: array of group IDs separated by comma (optional)
 * - languageCode: language code for filtering (optional, defaults to user's learnLanguage)
 * - source: user | base (default 'user') - word source: 'user' - from user's vocabulary, 'base' - from BaseWord by groups
 * - includeAllGroups: true | false (default false) - include all available groups (works only with source='base')
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

        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get('status');
        const limitParam = searchParams.get('limit');
        const randomParam = searchParams.get('random');
        const groupIdsParam = searchParams.get('groupIds');
        const languageCodeParam = searchParams.get('languageCode');
        const sourceParam = searchParams.get('source') || 'user';
        const includeAllGroupsParam = searchParams.get('includeAllGroups');

        // Determine language for filtering
        const languageCode =
            languageCodeParam || user.learnLanguage?.code || null;

        // Determine translation language (user's ownLanguage)
        const translationLanguageCode = user.ownLanguage?.code || 'ru';

        // Parse parameters
        const limit = Math.min(
            Math.max(parseInt(limitParam || '10') || 10, 1),
            50,
        );
        const random = randomParam !== 'false';
        const source = sourceParam === 'base' ? 'base' : 'user';
        const includeAllGroups = includeAllGroupsParam === 'true';
        const groupIds = groupIdsParam
            ? groupIdsParam
                  .split(',')
                  .map(id => parseInt(id.trim()))
                  .filter(id => !isNaN(id))
            : null;

        // Build WHERE condition
        const where: any = {
            userId,
        };

        // Filter by status
        if (statusParam && ['LEARNED', 'NOT_LEARNED'].includes(statusParam)) {
            const wordStatus = await prisma.wordStatus.findUnique({
                where: { code: statusParam },
            });
            if (wordStatus) {
                where.statusId = wordStatus.id;
            }
        }

        // Filter by language
        if (languageCode) {
            const language = await prisma.language.findUnique({
                where: { code: languageCode },
            });
            if (language) {
                where.languageId = language.id;
            }
        }

        // If source='base', get words from BaseWord by groups
        if (source === 'base') {
            // Determine groups for query
            let targetGroupIds: number[] = [];

            if (includeAllGroups) {
                // Get all user available groups
                const availableGroups = await prisma.wordGroup.findMany({
                    where: {
                        OR: [
                            { visibility: 'PUBLIC', isApproved: true },
                            {
                                visibility: 'SHARED',
                                sharedWith: { some: { userId } },
                            },
                            { createdByUserId: userId },
                        ],
                        ...(languageCode
                            ? {
                                  language: { code: languageCode },
                              }
                            : {}),
                    },
                    select: { id: true },
                });
                targetGroupIds = availableGroups.map(g => g.id);
            } else if (groupIds && groupIds.length > 0) {
                // Check access to specified groups
                const accessibleGroups = await prisma.wordGroup.findMany({
                    where: {
                        id: { in: groupIds },
                        OR: [
                            { visibility: 'PUBLIC', isApproved: true },
                            {
                                visibility: 'SHARED',
                                sharedWith: { some: { userId } },
                            },
                            { createdByUserId: userId },
                        ],
                    },
                    select: { id: true },
                });
                targetGroupIds = accessibleGroups.map(g => g.id);
            }

            if (targetGroupIds.length === 0) {
                return NextResponse.json([]);
            }

            // Get BaseWord from selected groups
            const baseWordsInGroups = await prisma.baseWordOnWordGroup.findMany(
                {
                    where: {
                        wordGroupId: { in: targetGroupIds },
                    },
                    select: {
                        baseWordId: true,
                    },
                },
            );

            const baseWordIds = Array.from(
                new Set(baseWordsInGroups.map(bw => bw.baseWordId)),
            );

            if (baseWordIds.length === 0) {
                return NextResponse.json([]);
            }

            // Get BaseWord with translations and examples
            const baseWords = await prisma.baseWord.findMany({
                where: {
                    id: { in: baseWordIds },
                    ...(languageCode
                        ? {
                              language: { code: languageCode },
                          }
                        : {}),
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
                    userWords: {
                        where: { userId },
                        select: {
                            id: true,
                            statusId: true,
                            selectedTranslationId: true,
                        },
                        take: 1,
                    },
                },
            });

            // Get existing user words for belongsToUser check
            const userWordsMap = new Map(
                (
                    await prisma.word.findMany({
                        where: {
                            userId,
                            baseWordId: { in: baseWordIds },
                        },
                        select: {
                            id: true,
                            baseWordId: true,
                            statusId: true,
                            selectedTranslationId: true,
                        },
                    })
                ).map(w => [w.baseWordId, w]),
            );

            // Transform BaseWord to Word format for compatibility
            const wordStatusNotLearned = await prisma.wordStatus.findFirst({
                where: { code: 'NOT_LEARNED' },
            });
            const wordStatusLearned = await prisma.wordStatus.findUnique({
                where: { code: 'LEARNED' },
            });

            let words = baseWords.map(baseWord => {
                const userWord = userWordsMap.get(baseWord.id);
                const belongsToUser = !!userWord;

                return {
                    id: userWord?.id?.toString() || `base-${baseWord.id}`,
                    userId: userId.toString(),
                    baseWordId: baseWord.id.toString(),
                    customWord: null,
                    languageId: baseWord.languageId.toString(),
                    language: {
                        id: baseWord.language.id.toString(),
                        code: baseWord.language.code,
                        name: baseWord.language.name,
                    },
                    status: userWord
                        ? userWord.statusId === wordStatusLearned?.id
                            ? 'LEARNED'
                            : 'NOT_LEARNED'
                        : 'NOT_LEARNED',
                    statusId:
                        userWord?.statusId || wordStatusNotLearned?.id || 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    belongsToUser,
                    baseWord: {
                        ...baseWord,
                        id: baseWord.id.toString(),
                        languageId: baseWord.languageId.toString(),
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
                    },
                    customTranslations: [],
                    trainingSessions: [],
                };
            });

            // Apply random order if needed
            if (random && words.length > 0) {
                // Fisher-Yates shuffle
                for (let index = words.length - 1; index > 0; index--) {
                    const randomIndex = Math.floor(Math.random() * (index + 1));
                    [words[index], words[randomIndex]] = [
                        words[randomIndex],
                        words[index],
                    ];
                }
            }

            // Limit quantity
            words = words.slice(0, limit);

            // Serialize words
            const serializedWords = words.map((word: any) => {
                const {
                    status,
                    baseWord,
                    customTranslations: _customTranslations,
                    ...restWord
                } = word;

                return {
                    ...restWord,
                    status: typeof status === 'string' ? status : status.code,
                    baseWord: baseWord
                        ? {
                              ...baseWord,
                              examples: baseWord.examples.map(
                                  (example: any) => ({
                                      ...example,
                                      sentenceType: example.sentenceType,
                                      translationLanguage:
                                          example.translationLanguage
                                              ? {
                                                    id: example
                                                        .translationLanguage.id,
                                                    code: example
                                                        .translationLanguage
                                                        .code,
                                                    name: example
                                                        .translationLanguage
                                                        .name,
                                                }
                                              : null,
                                  }),
                              ),
                              grammaticalExamples:
                                  baseWord.grammaticalExamples.map(
                                      (example: any) => ({
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
        }

        // Original logic for source='user'
        // Filter by word groups
        if (groupIds && groupIds.length > 0) {
            // Get baseWordId from groups
            const baseWordsInGroups = await prisma.baseWordOnWordGroup.findMany(
                {
                    where: {
                        wordGroupId: { in: groupIds },
                    },
                    select: {
                        baseWordId: true,
                    },
                },
            );

            const baseWordIds = baseWordsInGroups.map(bw => bw.baseWordId);

            if (baseWordIds.length > 0) {
                where.baseWordId = { in: baseWordIds };
            } else {
                // If no words in groups, return empty array
                return NextResponse.json([]);
            }
        }

        // Get words
        let words = await prisma.word.findMany({
            where,
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
                        userId,
                        translationLanguage: {
                            code: translationLanguageCode,
                        },
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

        // Apply random order if needed
        if (random && words.length > 0) {
            // Fisher-Yates shuffle
            for (let index = words.length - 1; index > 0; index--) {
                const randomIndex = Math.floor(Math.random() * (index + 1));
                [words[index], words[randomIndex]] = [
                    words[randomIndex],
                    words[index],
                ];
            }
        }

        // Limit quantity
        words = words.slice(0, limit);

        // Serialize words
        const serializedWords = words.map((word: any) => {
            const { status, baseWord, customTranslations, ...restWord } = word;

            // Determine if word belongs to user (calculate before starting exercise)
            const belongsToUser = word.userId === userId;

            return {
                ...restWord,
                status: status.code,
                belongsToUser,
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
        console.error('Error fetching review words:', error);
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
