import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { cleanupTestDatabase } from '../../fixtures';

/**
 * Тесты защиты роутов (редирект на логин для неавторизованных пользователей)
 */
test.describe('Авторизация - Защита роутов', () => {
    test.beforeEach(async () => {
        // Очищаем БД перед каждым тестом для изоляции
        await cleanupTestDatabase();
    });

    test('редирект на логин при попытке доступа к главной странице', async ({
        page,
    }) => {
        // Пытаемся перейти на главную страницу без авторизации
        await page.goto('/');

        // Проверяем, что произошел редирект на страницу входа
        await expect(page).toHaveURL(/\/auth\/login/);

        // Проверяем, что страница логина загрузилась
        const loginPage = new LoginPage(page);
        await loginPage.expectPageLoaded();
    });

    test('редирект на логин при попытке доступа к странице слов', async ({
        page,
    }) => {
        // Пытаемся перейти на страницу слов без авторизации
        await page.goto('/words');

        // Проверяем, что произошел редирект на страницу входа
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('редирект на логин при попытке доступа к странице тренировки', async ({
        page,
    }) => {
        // Пытаемся перейти на страницу тренировки без авторизации
        await page.goto('/training');

        // Проверяем, что произошел редирект на страницу входа
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('редирект на логин при попытке доступа к странице настроек', async ({
        page,
    }) => {
        // Пытаемся перейти на страницу настроек без авторизации
        await page.goto('/settings');

        // Проверяем, что произошел редирект на страницу входа
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('доступ к странице логина без авторизации', async ({ page }) => {
        // Страница логина должна быть доступна без авторизации
        await page.goto('/auth/login');

        // Проверяем, что остались на странице логина
        await expect(page).toHaveURL(/\/auth\/login/);

        const loginPage = new LoginPage(page);
        await loginPage.expectPageLoaded();
    });

    test('доступ к странице регистрации без авторизации', async ({ page }) => {
        // Страница регистрации должна быть доступна без авторизации
        await page.goto('/auth/register');

        // Проверяем, что остались на странице регистрации
        await expect(page).toHaveURL(/\/auth\/register/);
    });
});
