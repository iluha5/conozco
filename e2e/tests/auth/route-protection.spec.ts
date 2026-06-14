import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { cleanupTestDatabase } from '../../fixtures';

/**
 * Route access tests for guest and authenticated users
 */
test.describe('Auth - Route access', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('allows home page without authentication', async ({ page }) => {
        await page.goto('/');

        await expect(page).toHaveURL('/');
        await expect(page.getByRole('link', { name: 'conozco' })).toBeVisible();
    });

    test('allows words page without authentication', async ({ page }) => {
        await page.goto('/words');

        await expect(page).toHaveURL('/words');
    });

    test('allows training list without authentication', async ({ page }) => {
        await page.goto('/training/list');

        await expect(page).toHaveURL('/training/list');
    });

    test('redirects guest from active training page to training list', async ({
        page,
    }) => {
        await page.goto('/training');

        await expect(page).toHaveURL(/\/training\/list/);
    });

    test('allows settings page without authentication', async ({ page }) => {
        await page.goto('/settings');

        await expect(page).toHaveURL('/settings');
    });

    test('allows login page without authentication', async ({ page }) => {
        await page.goto('/auth/login');

        await expect(page).toHaveURL(/\/auth\/login/);

        const loginPage = new LoginPage(page);
        await loginPage.expectPageLoaded();
    });

    test('allows registration page without authentication', async ({
        page,
    }) => {
        await page.goto('/auth/register');

        await expect(page).toHaveURL(/\/auth\/register/);
    });
});
