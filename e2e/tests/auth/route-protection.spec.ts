import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { cleanupTestDatabase } from '../../fixtures';

/**
 * Route protection tests (redirect to login for unauthenticated users)
 */
test.describe('Auth - Route protection', () => {
    test.beforeEach(async () => {
        // Clean DB before each test for isolation
        await cleanupTestDatabase();
    });

    test('redirects to login when accessing home page', async ({ page }) => {
        // Try home page without authentication
        await page.goto('/');

        // Should redirect to login
        await expect(page).toHaveURL(/\/auth\/login/);

        // Login page should load
        const loginPage = new LoginPage(page);
        await loginPage.expectPageLoaded();
    });

    test('redirects to login when accessing words page', async ({ page }) => {
        // Try words page without authentication
        await page.goto('/words');

        // Should redirect to login
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('redirects to login when accessing training page', async ({
        page,
    }) => {
        // Try training page without authentication
        await page.goto('/training');

        // Should redirect to login
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('redirects to login when accessing settings page', async ({
        page,
    }) => {
        // Try settings page without authentication
        await page.goto('/settings');

        // Should redirect to login
        await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('allows login page without authentication', async ({ page }) => {
        // Login page should be public
        await page.goto('/auth/login');

        // Should stay on login page
        await expect(page).toHaveURL(/\/auth\/login/);

        const loginPage = new LoginPage(page);
        await loginPage.expectPageLoaded();
    });

    test('allows registration page without authentication', async ({
        page,
    }) => {
        // Registration page should be public
        await page.goto('/auth/register');

        // Should stay on registration page
        await expect(page).toHaveURL(/\/auth\/register/);
    });
});
