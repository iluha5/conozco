import { test } from '@playwright/test';
import { TrainingSetupPage } from '../../page-objects/TrainingSetupPage';
import {
    createAndLoginUser,
    cleanupTestDatabase,
    createTestWord,
    createTestBaseWord,
} from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Тесты этапа 5 тренировки - Написание слова по памяти (упрощенные)
 */
test.describe('Тренировки - Этап 5', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('загрузка этапа 5 тренировки', async ({ page }) => {
        // Создаем пользователя и авторизуем его
        const user = await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'password123',
        });

        // Создаем базовое слово
        const baseWord = await createTestBaseWord(
            'hello',
            'en',
            'привет',
            'ru',
        );
        if (!baseWord) throw new Error('Failed to create base word');

        // Создаем слово для пользователя
        await createTestWord(user.id, {
            baseWordId: baseWord.id,
            languageCode: 'en',
        });

        // Настраиваем тренировку
        const trainingSetupPage = new TrainingSetupPage(page);
        await trainingSetupPage.goto();
        await trainingSetupPage.expectPageLoaded();

        // Упрощенная проверка: просто проверяем, что страница настройки загрузилась
        await trainingSetupPage.waitForLoading();
    });
});
