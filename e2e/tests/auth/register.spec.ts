import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../page-objects/RegisterPage';
import { LoginPage } from '../../page-objects/LoginPage';
import { createTestUser, cleanupTestDatabase } from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Registration page tests
 */
test.describe('Auth - Registration', () => {
    test.beforeEach(async () => {
        // Clean DB before each test for isolation
        await cleanupTestDatabase();
    });

    test('registers a new user successfully', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.expectPageLoaded();

        const email = generateUniqueEmail();
        const password = 'password123';
        const name = 'Test User';
        const adminPassword = 'admin123'; // Default admin password

        // Perform registration
        await registerPage.register(email, password, adminPassword, name);

        // Assert successful registration (redirect to login)
        await registerPage.expectSuccessfulRegistration();

        // Should be able to log in with new credentials
        const loginPage = new LoginPage(page);
        // Wait for login page after redirect
        await loginPage.expectPageLoaded();
        await loginPage.login(email, password);

        // Wait for successful login (redirect to training list)
        // Session setup may take a moment
        await page.waitForURL('/training/list', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await loginPage.expectSuccessfulLogin();
    });

    test('shows error with wrong admin password', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        const email = generateUniqueEmail();
        const password = 'password123';
        const wrongAdminPassword = 'wrongadmin';

        // Try registration with wrong admin password
        await registerPage.register(email, password, wrongAdminPassword);

        // Expect error (message may vary — only assert error is shown)
        await registerPage.expectError();

        // Should stay on registration page
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('shows error when email already exists', async ({ page }) => {
        // Create user beforehand
        const existingEmail = 'existing@example.com';
        await createTestUser(existingEmail, 'password123');

        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        // Try registration with existing email
        await registerPage.register(
            existingEmail,
            'newpassword123',
            'admin123',
        );

        // Expect error
        await registerPage.expectError();

        // Should stay on registration page
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('shows error with short password', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        const email = generateUniqueEmail();
        const shortPassword = '12345'; // Less than 6 characters
        const adminPassword = 'admin123';

        // Try registration with short password
        await registerPage.register(email, shortPassword, adminPassword);

        // Expect validation error (message may vary)
        await registerPage.expectError();

        // Should stay on registration page
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('shows error with empty required fields', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        // Try registration without filling fields
        await registerPage.clickSubmit();

        // Expect validation error (message may vary)
        await registerPage.expectError();

        // Should stay on registration page
        await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('navigates to login page', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();

        // Click login link
        await registerPage.clickLoginLink();

        // Should navigate to login page
        await expect(page).toHaveURL(/\/auth\/login/);
    });
});
