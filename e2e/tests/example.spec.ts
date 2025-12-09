import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { createAndLoginUser } from '../fixtures';

/**
 * Пример теста для проверки конфигурации Playwright
 * Демонстрирует использование Page Object Model и фикстур
 */
test.describe('Примеры использования фикстур', () => {
    test.beforeEach(async () => {
        // Очистка БД перед каждым тестом (опционально)
        // В реальных тестах можно использовать beforeEach или beforeAll
        // await cleanupTestDatabase();
    });

    test('проверка базовой конфигурации', async ({ page }) => {
        // Главная страница защищена middleware, поэтому редиректит на логин
        // Проверяем, что редирект работает корректно
        await page.goto('/');

        // Ожидаем редирект на страницу логина
        await expect(page).toHaveURL(/\/auth\/login/);

        // Проверяем заголовок страницы логина
        await expect(page).toHaveTitle(/Flash Cards/i);
    });

    test('пример использования фикстур авторизации', async ({ page }) => {
        // Создаем пользователя и авторизуем его через UI
        const user = await createAndLoginUser(page, {
            email: `test-${Date.now()}@example.com`,
            password: 'testpassword123',
            name: 'Test User',
        });

        // Проверяем, что пользователь авторизован (Header виден)
        const homePage = new HomePage(page);
        await homePage.expectPageLoaded();

        // Можно использовать user.id для дальнейших операций
        expect(user.id).toBeGreaterThan(0);
        expect(user.email).toContain('@example.com');
    });
});
