import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../page-objects/RegisterPage';
import { LoginPage } from '../../page-objects/LoginPage';
import { HeaderPage } from '../../page-objects/Header';
import {
    createTestUser,
    cleanupTestDatabase,
    createAdminAndLoginUser,
} from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';
import { DEFAULT_TEST_VALUES } from '../../utils/constants';

/**
 * Admin registration page tests
 */
test.describe('Auth - Registration', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('registers a new user successfully as admin', async ({ page }) => {
        await createAdminAndLoginUser(page);

        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.expectPageLoaded();

        const email = generateUniqueEmail();
        const password = DEFAULT_TEST_VALUES.PASSWORD;
        const name = 'Test User';
        const adminPassword = DEFAULT_TEST_VALUES.ADMIN_PASSWORD;

        await registerPage.register(email, password, adminPassword, name);
        await registerPage.expectSuccessfulRegistration();

        const loginPage = new LoginPage(page);
        await loginPage.expectPageLoaded();
        await loginPage.login(email, password);

        await page.waitForURL('/training/list', { timeout: 10000 });
        await loginPage.expectSuccessfulLogin();

        const header = new HeaderPage(page);
        await header.expectAuthenticatedState(email);
    });

    test('shows error with wrong admin password', async ({ page }) => {
        await createAdminAndLoginUser(page);

        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        const email = generateUniqueEmail();
        const password = DEFAULT_TEST_VALUES.PASSWORD;
        const wrongAdminPassword = 'wrongadmin';

        await registerPage.register(email, password, wrongAdminPassword);

        await registerPage.expectError();
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('shows error when email already exists', async ({ page }) => {
        const existingEmail = 'existing@example.com';
        await createTestUser(existingEmail, DEFAULT_TEST_VALUES.PASSWORD);

        await createAdminAndLoginUser(page);

        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        await registerPage.register(
            existingEmail,
            'newpassword123',
            DEFAULT_TEST_VALUES.ADMIN_PASSWORD,
        );

        await registerPage.expectError();
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('shows error with short password', async ({ page }) => {
        await createAdminAndLoginUser(page);

        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        const email = generateUniqueEmail();
        const shortPassword = '12345';
        const adminPassword = DEFAULT_TEST_VALUES.ADMIN_PASSWORD;

        await registerPage.register(email, shortPassword, adminPassword);

        await registerPage.expectError();
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('shows error with empty required fields', async ({ page }) => {
        await createAdminAndLoginUser(page);

        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        await registerPage.clickSubmit();

        await registerPage.expectError();
        await expect(page).toHaveURL(/\/auth\/register/);
    });
});
