import { test, expect } from '@playwright/test';
import { HeaderPage } from '../../page-objects/Header';
import { createAndLoginUser, cleanupTestDatabase } from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Тесты выхода из системы
 */
test.describe('Авторизация - Выход', () => {
    test.beforeEach(async () => {
        // Очищаем БД перед каждым тестом для изоляции
        await cleanupTestDatabase();
    });

    test('успешный выход из системы', async ({ page }) => {
        // Создаем пользователя и авторизуем его
        await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'password123',
        });

        // Проверяем, что пользователь авторизован (Header виден)
        const header = new HeaderPage(page);
        await header.expectHeaderVisible();

        // Выполняем выход
        await header.logout();

        // Проверяем, что произошел редирект на страницу входа
        await expect(page).toHaveURL(/\/auth\/login/);

        // Проверяем, что Header больше не виден
        const headerElement = page.locator('[data-test="header-wrapper"]');
        await expect(headerElement).not.toBeVisible();
    });

    test('невозможность доступа к защищенным роутам после выхода', async ({
        page,
    }) => {
        // Создаем пользователя и авторизуем его
        await createAndLoginUser(page);

        // Выполняем выход
        const header = new HeaderPage(page);
        await header.logout();

        // Пытаемся перейти на защищенную страницу
        await page.goto('/words');

        // Проверяем, что произошел редирект на страницу входа
        await expect(page).toHaveURL(/\/auth\/login/);
    });
});
