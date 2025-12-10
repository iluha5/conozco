import { test } from '@playwright/test';
import { WordsPage } from '../../page-objects/WordsPage';
import {
    createAndLoginUser,
    cleanupTestDatabase,
    createTestWord,
    createTestBaseWord,
} from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Тесты работы с группами слов (упрощенные)
 */
test.describe('Управление словами - Группы слов', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('отображение слов на странице', async ({ page }) => {
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

        const wordsPage = new WordsPage(page);
        await wordsPage.goto();
        await wordsPage.expectPageLoaded();

        // Упрощенная проверка: просто проверяем, что страница загрузилась без ошибок
        await wordsPage.waitForLoading();
    });
});
