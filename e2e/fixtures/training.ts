import { Page } from '@playwright/test';
import {
    createAndLoginUser,
    createTestBaseWord,
    createTestWord,
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
 * Создает пару базовое слово + слово пользователя
 * @param userId ID пользователя
 * @param word Текст слова
 * @param translation Перевод
 * @param wordLang Код языка слова (по умолчанию 'en')
 * @param translationLang Код языка перевода (по умолчанию 'ru')
 * @returns Пара базовое слово и слово пользователя
 */
export async function createTrainingWordPair(
    userId: number,
    word: string,
    translation: string,
    wordLang: string = 'en',
    translationLang: string = 'ru',
): Promise<TrainingWordPair> {
    // Создаем базовое слово
    const baseWord = await createTestBaseWord(
        word,
        wordLang,
        translation,
        translationLang,
    );

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
    words: Array<{ word: string; translation: string }> = [
        { word: 'hello', translation: 'привет' },
    ],
): Promise<TrainingSetupResult> {
    // 1. Создание пользователя
    const user = await createAndLoginUser(page);

    // 2. Создание слов
    const wordPairs = await Promise.all(
        words.map(w => createTrainingWordPair(user.id, w.word, w.translation)),
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
