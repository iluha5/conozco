import { Page } from '@playwright/test';
import {
    createAndLoginUser,
    createTestBaseWord,
    createTestWord,
    createTestPrismaClient,
    getLanguageId,
} from './index';
import type { TestUserCredentials } from './auth';
import { TrainingPage } from '../page-objects/TrainingPage';
import { TrainingSetupPage } from '../page-objects/TrainingSetupPage';
import { STAGE_TITLES } from '../utils/training-constants';

/**
 * Пара слов для тренировки
 */
export interface TrainingWordPair {
    baseWord: Awaited<ReturnType<typeof createTestBaseWord>>;
    word: Awaited<ReturnType<typeof createTestWord>>;
}

/**
 * Результат настройки тренировки
 */
export interface TrainingSetupResult {
    user: TestUserCredentials & { id: number };
    trainingPage: TrainingPage;
    trainingSetupPage: TrainingSetupPage;
    baseWord: NonNullable<Awaited<ReturnType<typeof createTestBaseWord>>>;
    word: Awaited<ReturnType<typeof createTestWord>>;
    wordPairs: TrainingWordPair[];
}

/**
 * Получает или создает местоимение для языка
 */
async function getOrCreatePronoun(
    languageId: number,
    pronoun: string = 'I',
): Promise<number> {
    const prisma = createTestPrismaClient();

    try {
        const existingPronoun = await prisma.pronoun.findUnique({
            where: {
                pronoun_languageId: {
                    pronoun,
                    languageId,
                },
            },
        });

        if (existingPronoun) {
            return existingPronoun.id;
        }

        const newPronoun = await prisma.pronoun.create({
            data: {
                pronoun,
                languageId,
            },
        });

        return newPronoun.id;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Получает ID типа предложения по коду
 */
async function getSentenceTypeId(
    code: string = 'AFFIRMATIVE',
): Promise<number> {
    const prisma = createTestPrismaClient();

    try {
        const sentenceType = await prisma.sentenceType.findUnique({
            where: { code },
        });

        if (!sentenceType) {
            throw new Error(`Sentence type "${code}" not found`);
        }

        return sentenceType.id;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Создает базовое слово с примерами предложений
 */
async function createBaseWordWithExamples(
    word: string,
    languageCode: string,
    translation: string,
    translationLanguageCode: string,
    examples: Array<{
        example: string;
        translation: string;
        pronoun?: string;
    }>,
): Promise<Awaited<ReturnType<typeof createTestBaseWord>>> {
    const prisma = createTestPrismaClient();

    try {
        const languageId = await getLanguageId(languageCode);
        const translationLanguageId = await getLanguageId(
            translationLanguageCode,
        );

        // Получаем источник 'native'
        const source = await prisma.wordSource.findUnique({
            where: { code: 'native' },
        });

        if (!source) {
            throw new Error('Word source "native" not found');
        }

        // Получаем тип предложения
        const sentenceTypeId = await getSentenceTypeId('AFFIRMATIVE');

        // Проверяем, существует ли уже базовое слово
        let baseWord = await prisma.baseWord.findUnique({
            where: {
                word_languageId: {
                    word,
                    languageId,
                },
            },
            include: {
                translations: true,
                language: true,
                examples: true,
            },
        });

        if (!baseWord) {
            // Создаем новое базовое слово
            baseWord = await prisma.baseWord.create({
                data: {
                    word,
                    languageId,
                    sourceId: source.id,
                    translations: {
                        create: {
                            languageId: translationLanguageId,
                            translation,
                            priority: 1,
                        },
                    },
                },
                include: {
                    translations: true,
                    language: true,
                    examples: true,
                },
            });
        } else {
            // Проверяем, существует ли уже перевод
            const existingTranslation = await prisma.wordTranslation.findFirst({
                where: {
                    baseWordId: baseWord.id,
                    languageId: translationLanguageId,
                },
            });

            if (!existingTranslation) {
                // Добавляем перевод к существующему слову
                await prisma.wordTranslation.create({
                    data: {
                        baseWordId: baseWord.id,
                        languageId: translationLanguageId,
                        translation,
                        priority: 1,
                    },
                });
            }
        }

        // Добавляем примеры предложений
        for (const exampleData of examples) {
            const pronounText = exampleData.pronoun || 'I';
            const pronounId = await getOrCreatePronoun(languageId, pronounText);

            // Проверяем, существует ли уже такой пример
            const existingExample = await prisma.wordExample.findFirst({
                where: {
                    baseWordId: baseWord.id,
                    pronounId,
                    example: exampleData.example,
                },
            });

            if (!existingExample) {
                await prisma.wordExample.create({
                    data: {
                        baseWordId: baseWord.id,
                        pronounId,
                        example: exampleData.example,
                        translation: exampleData.translation,
                        translationLanguageId,
                        sentenceTypeId,
                        sourceId: source.id,
                    },
                });
            }
        }

        // Обновляем объект baseWord с примерами
        baseWord = await prisma.baseWord.findUnique({
            where: { id: baseWord.id },
            include: {
                translations: true,
                language: true,
                examples: {
                    include: {
                        pronoun: true,
                        sentenceType: true,
                        translationLanguage: true,
                    },
                },
            },
        });

        return baseWord;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Создает пару базовое слово + слово пользователя
 * @param userId ID пользователя
 * @param word Текст слова
 * @param translation Перевод
 * @param wordLang Код языка слова (по умолчанию 'en')
 * @param translationLang Код языка перевода (по умолчанию 'ru')
 * @param examples Опциональные примеры предложений для этапа 5
 * @returns Пара базовое слово и слово пользователя
 */
export async function createTrainingWordPair(
    userId: number,
    word: string,
    translation: string,
    wordLang: string = 'en',
    translationLang: string = 'ru',
    examples?: Array<{
        example: string;
        translation: string;
        pronoun?: string;
    }>,
): Promise<TrainingWordPair> {
    // Создаем базовое слово
    let baseWord: Awaited<ReturnType<typeof createTestBaseWord>>;

    if (examples && examples.length > 0) {
        // Создаем слово с примерами
        baseWord = await createBaseWordWithExamples(
            word,
            wordLang,
            translation,
            translationLang,
            examples,
        );
    } else {
        // Создаем обычное слово без примеров
        baseWord = await createTestBaseWord(
            word,
            wordLang,
            translation,
            translationLang,
        );
    }

    if (!baseWord) {
        throw new Error('Failed to create base word');
    }

    // Создаем слово для пользователя
    const userWord = await createTestWord(userId, {
        baseWordId: baseWord.id,
        languageCode: wordLang,
    });

    return {
        baseWord,
        word: userWord,
    };
}

/**
 * Настраивает тренировку: создает пользователя, слова и запускает тренировку
 * @param page Страница Playwright
 * @param words Массив слов для создания (по умолчанию одно слово "hello"/"привет")
 * @returns Результат настройки тренировки
 */
export async function setupTrainingWithWords(
    page: Page,
    words: Array<{
        word: string;
        translation: string;
        examples?: Array<{
            example: string;
            translation: string;
            pronoun?: string;
        }>;
    }> = [{ word: 'hello', translation: 'привет' }],
): Promise<TrainingSetupResult> {
    // 1. Создание пользователя
    const user = await createAndLoginUser(page);

    // 2. Создание слов
    const wordPairs = await Promise.all(
        words.map(w =>
            createTrainingWordPair(
                user.id,
                w.word,
                w.translation,
                'en',
                'ru',
                w.examples,
            ),
        ),
    );

    // 3. Настройка тренировки
    const trainingSetupPage = new TrainingSetupPage(page);
    await trainingSetupPage.goto();
    await trainingSetupPage.expectPageLoaded();

    // 4. Запуск тренировки
    const started = await trainingSetupPage.waitAndStartTraining();
    if (!started) {
        throw new Error('Failed to start training - start button not enabled');
    }

    // 5. Ожидание запуска
    await page.waitForURL(/\/training/, { timeout: 5000 });

    // 6. Создание TrainingPage
    const trainingPage = new TrainingPage(page);
    await trainingPage.waitForTrainingStart();

    const firstPair = wordPairs[0];
    if (!firstPair.baseWord) {
        throw new Error('Failed to create base word');
    }

    return {
        user,
        trainingPage,
        trainingSetupPage,
        baseWord: firstPair.baseWord,
        word: firstPair.word,
        wordPairs,
    };
}

/**
 * Открывает конкретный этап тренировки
 * @param page Страница Playwright
 * @param stage Номер этапа (1-6)
 * @param trainingPage Опциональный объект TrainingPage (если уже создан)
 * @returns Объект TrainingPage
 */
export async function openTrainingStage(
    page: Page,
    stage: 1 | 2 | 3 | 4 | 5 | 6,
    trainingPage?: TrainingPage,
): Promise<TrainingPage> {
    const tp = trainingPage || new TrainingPage(page);

    // Проверяем, что страница тренировки загружена
    await tp.expectPageLoaded();

    // Кликаем на этап
    await tp.clickStage(stage);

    // Ждем появления заголовка этапа вместо фиксированного таймаута
    const expectedTitle = STAGE_TITLES[stage];
    await tp.expectStageTitle(expectedTitle);

    return tp;
}
