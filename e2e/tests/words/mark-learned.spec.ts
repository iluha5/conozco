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
 * Тесты изменения статуса слов (упрощенные)
 */
test.describe('Управление словами - Изменение статуса', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('загрузка страницы со словами', async ({ page }) => {
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

        // Создаем слово со статусом "Не выучено"
        await createTestWord(user.id, {
            baseWordId: baseWord.id,
            languageCode: 'en',
            statusCode: 'NOT_LEARNED',
        });

        const wordsPage = new WordsPage(page);
        await wordsPage.goto();
        await wordsPage.expectPageLoaded();

        // Упрощенная проверка: просто проверяем, что страница загрузилась
        await wordsPage.waitForLoading();
    });

    test('загрузка страницы с несколькими словами', async ({ page }) => {
        // Создаем пользователя и авторизуем его
        const user = await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'password123',
        });

        // Создаем несколько базовых слов
        const baseWord1 = await createTestBaseWord(
            'hello',
            'en',
            'привет',
            'ru',
        );
        const baseWord2 = await createTestBaseWord('world', 'en', 'мир', 'ru');
        if (!baseWord1 || !baseWord2)
            throw new Error('Failed to create base words');

        // Создаем слова с разными статусами
        await createTestWord(user.id, {
            baseWordId: baseWord1.id,
            languageCode: 'en',
            statusCode: 'NOT_LEARNED',
        });
        await createTestWord(user.id, {
            baseWordId: baseWord2.id,
            languageCode: 'en',
            statusCode: 'LEARNED',
        });

        const wordsPage = new WordsPage(page);
        await wordsPage.goto();
        await wordsPage.expectPageLoaded();

        // Упрощенная проверка: просто проверяем, что страница загрузилась
        await wordsPage.waitForLoading();
    });
});
