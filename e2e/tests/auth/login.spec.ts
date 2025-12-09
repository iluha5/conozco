import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { HomePage } from '../../page-objects/HomePage';
import { createTestUser, cleanupTestDatabase } from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Тесты страницы входа
 */
test.describe('Авторизация - Вход', () => {
    test.beforeEach(async () => {
        // Очищаем БД перед каждым тестом для изоляции
        await cleanupTestDatabase();
    });

    test('успешный вход с валидными данными', async ({ page }) => {
        // Создаем тестового пользователя с уникальным email
        const user = await createTestUser(
            generateUniqueEmail(),
            'password123',
            'Test User',
        );

        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.expectPageLoaded();

        // Выполняем вход
        await loginPage.login(user.email, 'password123');

        // Ждем успешного входа - редирект на главную страницу
        // Может потребоваться время на установку сессии NextAuth
        await page.waitForURL('/', { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        // Проверяем успешный вход (редирект на главную)
        await loginPage.expectSuccessfulLogin();

        // Проверяем, что Header виден (пользователь авторизован)
        const homePage = new HomePage(page);
        await homePage.expectPageLoaded();
    });

    test('вход с неверным email', async ({ page }) => {
        // Создаем пользователя с другим email
        await createTestUser('correct@example.com', 'password123');

        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Пытаемся войти с неверным email
        await loginPage.enterEmail('wrong@example.com');
        await loginPage.enterPassword('password123');
        await loginPage.clickSubmit();

        // Ожидаем ошибку
        await loginPage.expectError();
        // Проверяем, что остались на странице логина
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('вход с неверным паролем', async ({ page }) => {
        // Создаем тестового пользователя с уникальным email
        const user = await createTestUser(
            generateUniqueEmail(),
            'correctpassword',
        );

        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Пытаемся войти с неверным паролем
        await loginPage.enterEmail(user.email);
        await loginPage.enterPassword('wrongpassword');
        await loginPage.clickSubmit();

        // Ожидаем ошибку
        await loginPage.expectError();
        // Проверяем, что остались на странице логина
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('вход с пустыми полями', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Пытаемся войти без заполнения полей
        await loginPage.clickSubmit();

        // Ожидаем ошибку валидации
        await loginPage.expectError();
        // Проверяем, что остались на странице логина
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('переход на страницу регистрации', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Кликаем по ссылке регистрации
        await loginPage.clickRegisterLink();

        // Проверяем, что перешли на страницу регистрации
        await expect(page).toHaveURL(/\/auth\/register/);
    });
});
