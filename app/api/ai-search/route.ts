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
                language: true,
                translations: {
                    where: { language: { code: 'ru' } },
                    orderBy: { priority: 'asc' },
                    include: {
                        partOfSpeech: true,
                    },
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
        });

        // Если слово уже существует в базе, просто возвращаем его
        if (existingBaseWord) {
            return NextResponse.json(
                {
                    success: true,
                    baseWord: existingBaseWord,
                    foundExamples: existingBaseWord.examples?.length || 0,
                    alreadyExists: true,
                },
                { status: 200 },
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

        // Получаем источники для AI-поиска
        const deeplSource = await prisma.wordSource.findUnique({
            where: { code: 'DEEPL' },
        });

        const myMemorySource = await prisma.wordSource.findUnique({
            where: { code: 'MYMEMORY' },
        });

        const tatoebaSource = await prisma.wordSource.findUnique({
            where: { code: 'TATOEBA' },
        });

        if (!deeplSource || !myMemorySource || !tatoebaSource) {
            return NextResponse.json(
                { error: 'Required word sources not found in database' },
                { status: 500 },
            );
        }

        // Определяем какой источник использовать для BaseWord (DeepL или MyMemory)
        const wordSourceId =
            wordData.source === 'DEEPL' ? deeplSource.id : myMemorySource.id;

        // Создаем базовое слово в транзакции
        const result = await prisma.$transaction(async tx => {
            // Создаем базовое слово
            const baseWord = await tx.baseWord.create({
                data: {
                    word: trimmedWord,
                    language: {
                        connect: { id: language.id },
                    },
                    source: {
                        connect: { id: wordSourceId },
                    },
                },
            });

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
                // Примечание: partOfSpeechId не добавляется, т.к. AI search API не возвращает эту информацию
                // Часть речи может быть добавлена вручную пользователем или через другие источники
                await tx.wordTranslation.create({
                    data: {
                        baseWordId: baseWord.id,
                        languageId: targetLanguage.id,
                        translation: wordData.mainTranslation,
                        priority: 1,
                        // partOfSpeechId: null - по умолчанию
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
                                // partOfSpeechId: null - по умолчанию
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
                                    translationLanguageId: targetLanguage.id,
                                    sentenceTypeId: defaultSentenceType.id,
                                    sourceId: tatoebaSource.id,
                                },
                            });
                        }
                    }
                }
            }

            // Возвращаем базовое слово с дополнительными данными
            const completeBaseWord = await tx.baseWord.findUnique({
                where: { id: baseWord.id },
                include: {
                    language: true,
                    translations: {
                        where: { language: { code: 'ru' } },
                        orderBy: { priority: 'asc' },
                        include: {
                            partOfSpeech: true,
                        },
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
            });

            return completeBaseWord;
        });

        // Возвращаем результат
        return NextResponse.json(
            {
                success: true,
                baseWord: result,
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
