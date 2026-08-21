import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { HeaderPage } from '../../page-objects/Header';
import { createTestUser, cleanupTestDatabase } from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';
import { DEFAULT_TEST_VALUES } from '../../utils/constants';

/**
 * Login page tests
 */
test.describe('Auth - Login', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('logs in successfully with valid credentials', async ({ page }) => {
        const password = DEFAULT_TEST_VALUES.PASSWORD;
        const user = await createTestUser(
            generateUniqueEmail(),
            password,
            'Test User',
        );

        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.expectPageLoaded();

        await loginPage.login(user.email, password);

        await loginPage.expectSuccessfulLogin();

        const header = new HeaderPage(page);
        await header.expectAuthenticatedState(user.email);
    });

    test('shows error with wrong email', async ({ page }) => {
        await createTestUser(
            'correct@example.com',
            DEFAULT_TEST_VALUES.PASSWORD,
        );

        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await loginPage.enterEmail('wrong@example.com');
        await loginPage.enterPassword(DEFAULT_TEST_VALUES.PASSWORD);
        await loginPage.clickSubmit();

        await loginPage.expectError();
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('shows error with wrong password', async ({ page }) => {
        const user = await createTestUser(
            generateUniqueEmail(),
            'correctpassword',
        );

        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await loginPage.enterEmail(user.email);
        await loginPage.enterPassword('wrongpassword');
        await loginPage.clickSubmit();

        await loginPage.expectError();
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('shows error with empty fields', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await loginPage.clickSubmit();

        await loginPage.expectError();
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('navigates to registration page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await loginPage.clickRegisterLink();

        await expect(page).toHaveURL(/\/auth\/register-public/);
    });
});
