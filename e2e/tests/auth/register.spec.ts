import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../page-objects/RegisterPage';
import { LoginPage } from '../../page-objects/LoginPage';
import {
    createTestUser,
    cleanupTestDatabase,
    createAdminAndLoginUser,
} from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Admin registration page tests
 */
test.describe('Auth - Registration', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('redirects guest from admin registration page to login', async ({
        page,
    }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.expectRedirectToLogin();
    });

    test('registers a new user successfully as admin', async ({ page }) => {
        await createAdminAndLoginUser(page);

        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.expectPageLoaded();

        const email = generateUniqueEmail();
        const password = 'password123';
        const name = 'Test User';
        const adminPassword = 'admin123';

        await registerPage.register(email, password, adminPassword, name);
        await registerPage.expectSuccessfulRegistration();

        const loginPage = new LoginPage(page);
        await loginPage.expectPageLoaded();
        await loginPage.login(email, password);

        await page.waitForURL('/training/list', { timeout: 10000 });
        await loginPage.expectSuccessfulLogin();
    });

    test('shows error with wrong admin password', async ({ page }) => {
        await createAdminAndLoginUser(page);

        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        const email = generateUniqueEmail();
        const password = 'password123';
        const wrongAdminPassword = 'wrongadmin';

        await registerPage.register(email, password, wrongAdminPassword);

        await registerPage.expectError();
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('shows error when email already exists', async ({ page }) => {
        const existingEmail = 'existing@example.com';
        await createTestUser(existingEmail, 'password123');

        await createAdminAndLoginUser(page);

        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        await registerPage.register(
            existingEmail,
            'newpassword123',
            'admin123',
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
        const adminPassword = 'admin123';

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
