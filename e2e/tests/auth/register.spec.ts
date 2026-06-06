import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../page-objects/RegisterPage';
import { LoginPage } from '../../page-objects/LoginPage';
import { createTestUser, cleanupTestDatabase } from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Тесты страницы регистрации
 */
test.describe('Авторизация - Регистрация', () => {
    test.beforeEach(async () => {
        // Очищаем БД перед каждым тестом для изоляции
        await cleanupTestDatabase();
    });

    test('успешная регистрация нового пользователя', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.expectPageLoaded();

        const email = generateUniqueEmail();
        const password = 'password123';
        const name = 'Test User';
        const adminPassword = 'admin123'; // Дефолтный admin пароль

        // Выполняем регистрацию
        await registerPage.register(email, password, adminPassword, name);

        // Проверяем успешную регистрацию (редирект на страницу входа)
        await registerPage.expectSuccessfulRegistration();

        // Проверяем, что можем войти с новыми данными
        const loginPage = new LoginPage(page);
        // Ждем, пока страница логина загрузится после редиректа
        await loginPage.expectPageLoaded();
        await loginPage.login(email, password);

        // Ждем успешного входа (редирект на страницу тренировок)
        // Может потребоваться время на установку сессии
        await page.waitForURL('/training/list', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await loginPage.expectSuccessfulLogin();
    });

    test('регистрация с неверным admin паролем', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        const email = generateUniqueEmail();
        const password = 'password123';
        const wrongAdminPassword = 'wrongadmin';

        // Пытаемся зарегистрироваться с неверным admin паролем
        await registerPage.register(email, password, wrongAdminPassword);

        // Ожидаем ошибку (текст может быть разным, проверяем только наличие ошибки)
        await registerPage.expectError();

        // Проверяем, что остались на странице регистрации
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('регистрация с существующим email', async ({ page }) => {
        // Создаем пользователя заранее
        const existingEmail = 'existing@example.com';
        await createTestUser(existingEmail, 'password123');

        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        // Пытаемся зарегистрироваться с существующим email
        await registerPage.register(
            existingEmail,
            'newpassword123',
            'admin123',
        );

        // Ожидаем ошибку
        await registerPage.expectError();

        // Проверяем, что остались на странице регистрации
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('регистрация с коротким паролем', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        const email = generateUniqueEmail();
        const shortPassword = '12345'; // Меньше 6 символов
        const adminPassword = 'admin123';

        // Пытаемся зарегистрироваться с коротким паролем
        await registerPage.register(email, shortPassword, adminPassword);

        // Ожидаем ошибку валидации (текст может быть разным, проверяем только наличие ошибки)
        await registerPage.expectError();

        // Проверяем, что остались на странице регистрации
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('регистрация с пустыми обязательными полями', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        // Пытаемся зарегистрироваться без заполнения полей
        await registerPage.clickSubmit();

        // Ожидаем ошибку валидации (текст может быть разным, проверяем только наличие ошибки)
        await registerPage.expectError();

        // Проверяем, что остались на странице регистрации
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('переход на страницу входа', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        // Кликаем по ссылке входа
        await registerPage.clickLoginLink();

        // Проверяем, что перешли на страницу входа
        await expect(page).toHaveURL(/\/auth\/login/);
    });
});
