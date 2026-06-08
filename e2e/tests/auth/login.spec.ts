import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { createTestUser, cleanupTestDatabase } from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Login page tests
 */
test.describe('Auth - Login', () => {
    test.beforeEach(async () => {
        // Clean DB before each test for isolation
        await cleanupTestDatabase();
    });

    test('logs in successfully with valid credentials', async ({ page }) => {
        // Create test user with unique email
        const user = await createTestUser(
            generateUniqueEmail(),
            'password123',
            'Test User',
        );

        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.expectPageLoaded();

        // Perform login
        await loginPage.login(user.email, 'password123');

        // Wait for successful login — redirect to training list
        // NextAuth session setup may take a moment
        await page.waitForURL('/training/list', { timeout: 10000 });
        await page.waitForLoadState('networkidle');

        await loginPage.expectSuccessfulLogin();

        // Header should be visible (user is authenticated)
        await expect(page.getByRole('link', { name: 'conozco' })).toBeVisible();
    });

    test('shows error with wrong email', async ({ page }) => {
        // Create user with a different email
        await createTestUser('correct@example.com', 'password123');

        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Try login with wrong email
        await loginPage.enterEmail('wrong@example.com');
        await loginPage.enterPassword('password123');
        await loginPage.clickSubmit();

        // Expect error
        await loginPage.expectError();
        // Should stay on login page
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('shows error with wrong password', async ({ page }) => {
        // Create test user with unique email
        const user = await createTestUser(
            generateUniqueEmail(),
            'correctpassword',
        );

        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Try login with wrong password
        await loginPage.enterEmail(user.email);
        await loginPage.enterPassword('wrongpassword');
        await loginPage.clickSubmit();

        // Expect error
        await loginPage.expectError();
        // Should stay on login page
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('shows error with empty fields', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Try login without filling fields
        await loginPage.clickSubmit();

        // Expect validation error
        await loginPage.expectError();
        // Should stay on login page
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('navigates to registration page', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Click registration link
        await loginPage.clickRegisterLink();

        // Should navigate to registration page
        await expect(page).toHaveURL(/\/auth\/register/);
    });
});
