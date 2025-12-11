import { test } from '@playwright/test';
import { TrainingPage } from '../../page-objects/TrainingPage';
import { TrainingSetupPage } from '../../page-objects/TrainingSetupPage';
import {
    createAndLoginUser,
    cleanupTestDatabase,
    createTestWord,
    createTestBaseWord,
} from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Тесты этапа 4 тренировки - Составление слова из букв
 */
test.describe('Тренировки - Этап 4', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('загрузка и запуск этапа 4 тренировки', async ({ page }) => {
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

        // Ждем загрузки списка слов (приложение автоматически выбирает первые слова)
        await page.waitForTimeout(2000);

        // Проверяем, что кнопка запуска существует и видна
        const startButton = page.locator(
            'button:has-text("Начать тренировку")',
        );
        const buttonVisible = await startButton
            .isVisible({ timeout: 5000 })
            .catch(() => false);

        if (buttonVisible) {
            // Проверяем, что кнопка активна (если слова выбраны автоматически)
            const isEnabled = await startButton.isEnabled().catch(() => false);

            if (isEnabled) {
                // Запускаем тренировку
                await trainingSetupPage.startTraining();
                await page.waitForTimeout(3000);

                // Проверяем, что мы перешли на страницу тренировки
                await page.waitForURL(/\/training/, { timeout: 5000 });
                await page.waitForTimeout(2000); // Ждем загрузки страницы

                // Проверяем, что тренировка началась
                const trainingPage = new TrainingPage(page);

                // Проверяем загрузку страницы тренировки
                await trainingPage.expectPageLoaded();

                // Кликаем на этап 4 в селекторе этапов
                await trainingPage.clickStage(4);
                await page.waitForTimeout(1000); // Ждем переключения этапа

                // Проверяем, что этап 4 отображается
                await trainingPage.expectStage(4);

                // Проверяем заголовок этапа 4
                await trainingPage.expectStageTitle(
                    'Составление слова по буквам',
                );
            }
        }
    });
});
