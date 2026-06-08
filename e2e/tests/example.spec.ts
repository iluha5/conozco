import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';
import { createAndLoginUser } from '../fixtures';
import { generateUniqueEmail } from '../utils/test-helpers';

/**
 * Example test to verify Playwright configuration
 * Demonstrates Page Object Model and fixtures usage
 */
test.describe('Fixture usage examples', () => {
    test.beforeEach(async () => {
        // Optional DB cleanup before each test
        // In real tests use beforeEach or beforeAll
        // await cleanupTestDatabase();
    });

    test('verifies basic configuration', async ({ page }) => {
        // Home page is protected by middleware and redirects to login
        // Verify redirect works
        await page.goto('/');

        // Expect redirect to login page
        await expect(page).toHaveURL(/\/auth\/login/);

        // Verify login page title
        await expect(page).toHaveTitle(/conozco/i);
    });

    test('demonstrates auth fixture usage', async ({ page }) => {
        // Create user and log in via UI
        const user = await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'testpassword123',
            name: 'Test User',
        });

        // User should be authenticated (home page loads)
        const homePage = new HomePage(page);
        await homePage.expectPageLoaded();

        // user.id can be used for further setup
        expect(user.id).toBeGreaterThan(0);
        expect(user.email).toContain('@example.com');
    });
});
