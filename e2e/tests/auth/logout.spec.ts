import { test, expect } from '@playwright/test';
import { HeaderPage } from '../../page-objects/Header';
import { createAndLoginUser, cleanupTestDatabase } from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Logout tests
 */
test.describe('Auth - Logout', () => {
    test.beforeEach(async () => {
        // Clean DB before each test for isolation
        await cleanupTestDatabase();
    });

    test('logs out successfully', async ({ page }) => {
        // Create and log in user
        await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'password123',
        });

        // User should be authenticated (Header visible)
        const header = new HeaderPage(page);
        await header.expectHeaderVisible();

        // Log out
        await header.logout();

        // Should redirect to login page
        await expect(page).toHaveURL(/\/auth\/login/);

        // Header should no longer be visible
        const headerElement = page.locator('[data-test="header-wrapper"]');
        await expect(headerElement).not.toBeVisible();
    });

    test('blocks protected routes after logout', async ({ page }) => {
        // Create and log in user
        await createAndLoginUser(page);

        // Log out
        const header = new HeaderPage(page);
        await header.logout();

        // Try to access protected page
        await page.goto('/words');

        // Should redirect to login page
        await expect(page).toHaveURL(/\/auth\/login/);
    });
});
