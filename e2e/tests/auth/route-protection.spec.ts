import { test, expect } from '@playwright/test';
import { LoginPage } from '../../page-objects/LoginPage';
import { LandingPage } from '../../page-objects/LandingPage';
import { WordsPage } from '../../page-objects/WordsPage';
import { HeaderPage } from '../../page-objects/Header';
import { cleanupTestDatabase } from '../../fixtures';

/**
 * Route access tests for guest and authenticated users
 */
test.describe('Auth - Route access', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('allows home page without authentication', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.goto();

        await expect(page).toHaveURL('/');
        await landingPage.expectPageLoaded();

        const header = new HeaderPage(page);
        await header.expectGuestState();
    });

    test('allows words page without authentication', async ({ page }) => {
        const wordsPage = new WordsPage(page);
        await wordsPage.goto();

        await expect(page).toHaveURL('/words');
        await wordsPage.expectGuestPageLoaded();
    });

    test('allows training list without authentication', async ({ page }) => {
        await page.goto('/training/list');

        await expect(page).toHaveURL('/training/list');

        const header = new HeaderPage(page);
        await header.expectGuestState();
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
        await expect(
            page.getByRole('heading', { name: 'Settings', exact: true }),
        ).toBeVisible();
        await expect(
            page.getByText(
                'to save your profile and sync settings across devices.',
            ),
        ).toBeVisible();
    });

    test('allows login page without authentication', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        await expect(page).toHaveURL(/\/auth\/login/);
        await loginPage.expectPageLoaded();

        const header = new HeaderPage(page);
        await header.expectGuestState();
    });

    test('redirects guest from admin registration page to login', async ({
        page,
    }) => {
        await page.goto('/auth/register');

        await expect(page).toHaveURL(/\/auth\/login/);
    });
});
