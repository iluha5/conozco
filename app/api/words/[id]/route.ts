import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const serializeWord = (word: any) => {
    const { status, baseWord, customTranslations, ...rest } = word;

    return {
        ...rest,
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
        customTranslations: Array.isArray(customTranslations)
            ? customTranslations.map((ct: any) => ({
                  id: ct.id,
                  translation: ct.translation,
                  partOfSpeechId: ct.partOfSpeechId,
                  partOfSpeech: ct.partOfSpeech
                      ? {
                            id: ct.partOfSpeech.id,
                            name: ct.partOfSpeech.name,
                            displayName: ct.partOfSpeech.displayName,
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
};

// GET - получить одно слово
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
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

        const wordId = parseInt(params.id);
        if (isNaN(wordId)) {
            return NextResponse.json(
                { error: 'Invalid word ID' },
                { status: 400 },
            );
        }

        const word = await prisma.word.findFirst({
            where: {
                id: wordId,
                userId: parseInt(session.user.id),
            },
            include: {
                status: true,
                language: true,
                baseWord: {
                    include: {
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
                },
            },
        });

        if (!word) {
            return NextResponse.json(
                { error: 'Word not found' },
                { status: 404 },
            );
        }

        const normalized = serializeWord(word);

        return NextResponse.json(normalized);
    } catch (error) {
        console.error('Error fetching word:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}

// PATCH - обновить слово
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
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

        const wordId = parseInt(params.id);
        if (isNaN(wordId)) {
            return NextResponse.json(
                { error: 'Invalid word ID' },
                { status: 400 },
            );
        }

        const body = await request.json();

        // Проверяем, что слово принадлежит пользователю
        const existingWord = await prisma.word.findFirst({
            where: {
                id: wordId,
                userId: parseInt(session.user.id),
            },
            include: {
                language: true,
            },
        });

        if (!existingWord) {
            return NextResponse.json(
                { error: 'Word not found' },
                { status: 404 },
            );
        }

        // Если передан languageCode, получаем ID языка
        const data: any = { ...body };
        if (body.languageCode) {
            const language = await prisma.language.findUnique({
                where: { code: body.languageCode },
            });

            if (!language) {
                return NextResponse.json(
                    { error: 'Invalid language code' },
                    { status: 400 },
                );
            }

            data.languageId = language.id;
            delete data.languageCode;
        }

        if (body.status) {
            const statusRecord = await prisma.wordStatus.findUnique({
                where: { code: body.status },
            });

            if (!statusRecord) {
                return NextResponse.json(
                    { error: 'Invalid word status' },
                    { status: 400 },
                );
            }

            data.statusId = statusRecord.id;
            delete data.status;
        }

        // Обработка кастомного перевода
        if (body.customTranslation !== undefined) {
            // Если customTranslation === null, удаляем кастомный перевод
            if (body.customTranslation === null) {
                await prisma.customTranslation.deleteMany({
                    where: {
                        wordId: wordId,
                        userId: parseInt(session.user.id),
                    },
                });
            } else if (
                typeof body.customTranslation === 'object' &&
                body.customTranslation.translation
            ) {
                // Создаем или обновляем кастомный перевод
                const translationData = body.customTranslation;

                // Получаем языки
                const originalLanguage = await prisma.language.findUnique({
                    where: {
                        code:
                            translationData.originalLanguageCode ||
                            existingWord.language.code,
                    },
                });
                const translationLanguage = await prisma.language.findUnique({
                    where: {
                        code: translationData.translationLanguageCode || 'ru',
                    },
                });

                if (!originalLanguage || !translationLanguage) {
                    return NextResponse.json(
                        { error: 'Invalid language code' },
                        { status: 400 },
                    );
                }

                // Проверяем partOfSpeechId если передан
                let partOfSpeechId = null;
                if (translationData.partOfSpeechId) {
                    const partOfSpeech = await prisma.partOfSpeech.findUnique({
                        where: { id: translationData.partOfSpeechId },
                    });
                    if (partOfSpeech) {
                        partOfSpeechId = partOfSpeech.id;
                    }
                }

                await prisma.customTranslation.upsert({
                    where: {
                        wordId_userId: {
                            wordId: wordId,
                            userId: parseInt(session.user.id),
                        },
                    },
                    create: {
                        wordId: wordId,
                        userId: parseInt(session.user.id),
                        partOfSpeechId: partOfSpeechId,
                        originalLanguageId: originalLanguage.id,
                        translationLanguageId: translationLanguage.id,
                        translation: translationData.translation,
                    },
                    update: {
                        partOfSpeechId: partOfSpeechId,
                        originalLanguageId: originalLanguage.id,
                        translationLanguageId: translationLanguage.id,
                        translation: translationData.translation,
                    },
                });
            }

            // Удаляем customTranslation из data, чтобы не пытаться обновить Word
            delete data.customTranslation;
        }

        const word = await prisma.word.update({
            where: { id: wordId },
            data,
            include: {
                status: true,
                language: true,
                baseWord: {
                    include: {
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

        const normalized = serializeWord(word);

        return NextResponse.json(normalized);
    } catch (error) {
        console.error('Error updating word:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}

// DELETE - удалить слово
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
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

        const wordId = parseInt(params.id);
        if (isNaN(wordId)) {
            return NextResponse.json(
                { error: 'Invalid word ID' },
                { status: 400 },
            );
        }

        // Проверяем, что слово принадлежит пользователю
        const existingWord = await prisma.word.findFirst({
            where: {
                id: wordId,
                userId: parseInt(session.user.id),
            },
        });

        if (!existingWord) {
            return NextResponse.json(
                { error: 'Word not found' },
                { status: 404 },
            );
        }

        await prisma.word.delete({
            where: { id: wordId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting word:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
