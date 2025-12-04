import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/words/review - Универсальный endpoint для получения слов по различным критериям
 *
 * Query параметры:
 * - status: LEARNED | NOT_LEARNED (опционально)
 * - limit: количество слов (по умолчанию 10, максимум 50)
 * - random: true | false (по умолчанию true)
 * - groupIds: массив ID групп через запятую (опционально)
 * - languageCode: код языка для фильтрации (опционально, по умолчанию learnLanguage пользователя)
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

        // Проверить, существует ли пользователь в базе данных
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

        // Определяем язык для фильтрации
        const languageCode =
            languageCodeParam || user.learnLanguage?.code || null;

        // Определяем язык для переводов (ownLanguage пользователя)
        const translationLanguageCode = user.ownLanguage?.code || 'ru';

        // Парсим параметры
        const limit = Math.min(
            Math.max(parseInt(limitParam || '10') || 10, 1),
            50,
        );
        const random = randomParam !== 'false';
        const groupIds = groupIdsParam
            ? groupIdsParam
                  .split(',')
                  .map(id => parseInt(id.trim()))
                  .filter(id => !isNaN(id))
            : null;

        // Строим условие WHERE
        const where: any = {
            userId,
        };

        // Фильтр по статусу
        if (statusParam && ['LEARNED', 'NOT_LEARNED'].includes(statusParam)) {
            const wordStatus = await prisma.wordStatus.findUnique({
                where: { code: statusParam },
            });
            if (wordStatus) {
                where.statusId = wordStatus.id;
            }
        }

        // Фильтр по языку
        if (languageCode) {
            const language = await prisma.language.findUnique({
                where: { code: languageCode },
            });
            if (language) {
                where.languageId = language.id;
            }
        }

        // Фильтр по группам слов
        if (groupIds && groupIds.length > 0) {
            // Получаем baseWordId из групп
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
                // Если нет слов в группах, возвращаем пустой массив
                return NextResponse.json([]);
            }
        }

        // Получаем слова
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
                            include: {
                                pronoun: true,
                                sentenceType: true,
                                translationLanguage: true,
                            },
                        },
                        grammaticalExamples: {
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

        // Применяем случайный порядок если нужно
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

        // Ограничиваем количество
        words = words.slice(0, limit);

        // Сериализуем слова
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
