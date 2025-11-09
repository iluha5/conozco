import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWordData } from '@/lib/translation-api';

/**
 * POST /api/ai-search
 * Ищет слово через LibreTranslate и Tatoeba, затем добавляет его в базу данных
 */
export async function POST(request: NextRequest) {
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
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User session expired. Please sign in again.' },
                { status: 401 },
            );
        }

        const { word, languageCode } = await request.json();

        if (!word || !languageCode) {
            return NextResponse.json(
                { error: 'Word and language code are required' },
                { status: 400 },
            );
        }

        const trimmedWord = word.trim().toLowerCase();

        if (!trimmedWord) {
            return NextResponse.json(
                { error: 'Word cannot be empty' },
                { status: 400 },
            );
        }

        // Проверяем, что язык поддерживается
        const language = await prisma.language.findUnique({
            where: { code: languageCode },
        });

        if (!language) {
            return NextResponse.json(
                { error: 'Unsupported language' },
                { status: 400 },
            );
        }

        // Проверяем, не существует ли уже это слово в базе
        const existingBaseWord = await prisma.baseWord.findUnique({
            where: {
                word_languageId: {
                    word: trimmedWord,
                    languageId: language.id,
                },
            },
            include: {
                userWords: {
                    where: { userId },
                },
            },
        });

        if (existingBaseWord && existingBaseWord.userWords.length > 0) {
            return NextResponse.json(
                {
                    error: 'This word is already in your vocabulary',
                },
                { status: 409 },
            );
        }

        // Ищем слово через внешние API
        const wordData = await getWordData(
            trimmedWord,
            languageCode,
            'ru', // Целевой язык - русский
            userId,
        );

        // Проверяем на ошибки
        if ('error' in wordData) {
            return NextResponse.json(
                { error: wordData.error },
                { status: 500 },
            );
        }

        // Определяем часть речи (по умолчанию - существительное)
        // В будущем можно добавить определение части речи через AI
        const defaultPartOfSpeech = await prisma.partOfSpeech.findFirst({
            where: {
                name: 'NOUN',
                languageId: language.id,
            },
        });

        if (!defaultPartOfSpeech) {
            return NextResponse.json(
                { error: 'Default part of speech not found' },
                { status: 500 },
            );
        }

        // Получаем источники для AI-поиска
        const myMemorySource = await prisma.wordSource.findUnique({
            where: { code: 'MYMEMORY' },
        });

        const tatoebaSource = await prisma.wordSource.findUnique({
            where: { code: 'TATOEBA' },
        });

        if (!myMemorySource || !tatoebaSource) {
            return NextResponse.json(
                { error: 'Required word sources not found in database' },
                { status: 500 },
            );
        }

        // Создаем или обновляем базовое слово в транзакции
        const result = await prisma.$transaction(async tx => {
            // Создаем или получаем базовое слово
            let baseWord = existingBaseWord;

            if (!baseWord) {
                baseWord = await tx.baseWord.create({
                    data: {
                        word: trimmedWord,
                        languageId: language.id,
                        partOfSpeechId: defaultPartOfSpeech.id,
                        sourceId: myMemorySource.id,
                    },
                    include: {
                        userWords: true,
                    },
                });
            }

            // Гарантируем что baseWord не null
            if (!baseWord) {
                throw new Error('Failed to create or find base word');
            }

            // Получаем язык для переводов (русский)
            const targetLanguage = await tx.language.findUnique({
                where: { code: 'ru' },
            });

            if (!targetLanguage) {
                throw new Error('Target language (ru) not found');
            }

            // Добавляем переводы (если их еще нет)
            const existingTranslations = await tx.wordTranslation.findMany({
                where: {
                    baseWordId: baseWord.id,
                    languageId: targetLanguage.id,
                },
            });

            if (existingTranslations.length === 0) {
                // Добавляем главный перевод
                await tx.wordTranslation.create({
                    data: {
                        baseWordId: baseWord.id,
                        languageId: targetLanguage.id,
                        translation: wordData.mainTranslation,
                        priority: 1,
                    },
                });

                // Добавляем альтернативные переводы
                for (
                    let i = 0;
                    i < wordData.alternativeTranslations.length && i < 2;
                    i++
                ) {
                    const alt = wordData.alternativeTranslations[i];
                    if (alt && alt !== wordData.mainTranslation) {
                        await tx.wordTranslation.create({
                            data: {
                                baseWordId: baseWord.id,
                                languageId: targetLanguage.id,
                                translation: alt,
                                priority: i + 2,
                            },
                        });
                    }
                }
            }

            // Добавляем примеры предложений (если их еще нет и они были найдены)
            if (wordData.examples.length > 0) {
                const existingExamples = await tx.wordExample.findMany({
                    where: { baseWordId: baseWord.id },
                });

                if (existingExamples.length === 0) {
                    // Получаем дефолтное местоимение и тип предложения
                    const defaultPronoun = await tx.pronoun.findFirst({
                        where: { languageId: language.id },
                    });

                    const defaultSentenceType = await tx.sentenceType.findFirst(
                        {
                            where: {
                                isNegative: false,
                                isQuestion: false,
                            },
                        },
                    );

                    if (defaultPronoun && defaultSentenceType) {
                        // Добавляем до 5 примеров из Tatoeba
                        for (
                            let i = 0;
                            i < Math.min(5, wordData.examples.length);
                            i++
                        ) {
                            const example = wordData.examples[i];
                            await tx.wordExample.create({
                                data: {
                                    baseWordId: baseWord.id,
                                    pronounId: defaultPronoun.id,
                                    example: example.sentence,
                                    translation: example.translation,
                                    sentenceTypeId: defaultSentenceType.id,
                                    sourceId: tatoebaSource.id,
                                },
                            });
                        }
                    }
                }
            }

            // Добавляем слово в словарь пользователя
            const userWord = await tx.word.create({
                data: {
                    userId,
                    baseWordId: baseWord.id,
                    languageId: language.id,
                    customTranslation: wordData.mainTranslation,
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

            return userWord;
        });

        // Нормализуем ответ
        const { status, ...rest } = result as any;
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

        return NextResponse.json(
            {
                success: true,
                word: normalized,
                foundExamples: wordData.examples.length,
            },
            { status: 201 },
        );
    } catch (error: any) {
        console.error('Error in AI search:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error.message,
            },
            { status: 500 },
        );
    }
}
