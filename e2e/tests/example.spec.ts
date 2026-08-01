import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/LandingPage';
import { HeaderPage } from '../page-objects/Header';
import { createAndLoginUser, cleanupTestDatabase } from '../fixtures';
import { generateUniqueEmail } from '../utils/test-helpers';

/**
 * Example test to verify Playwright configuration
 */
test.describe('Fixture usage examples', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('verifies basic configuration', async ({ page }) => {
        const landingPage = new LandingPage(page);
        await landingPage.goto();
        await landingPage.expectPageLoaded();
        await expect(page).toHaveURL('/');
    });

    test('demonstrates auth fixture usage', async ({ page }) => {
        const user = await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'testpassword123',
            name: 'Test User',
        });

        await expect(page).toHaveURL('/training/list');

        const header = new HeaderPage(page);
        await header.expectHeaderVisible();

        expect(user.id).toBeGreaterThan(0);
        expect(user.email).toContain('@example.com');
    });
});
