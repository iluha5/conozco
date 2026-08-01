import { test, expect } from '@playwright/test';
import { HeaderPage } from '../../page-objects/Header';
import { createAndLoginUser, cleanupTestDatabase } from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Logout tests
 */
test.describe('Auth - Logout', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('logs out successfully', async ({ page }) => {
        await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'password123',
        });

        const header = new HeaderPage(page);
        await header.expectHeaderVisible();

        await header.logout();

        await expect(page).toHaveURL(/\/auth\/login/);

        const headerElement = page.locator('[data-test="header-wrapper"]');
        await expect(headerElement).not.toBeVisible();
    });

    test('shows guest words page after logout', async ({ page }) => {
        await createAndLoginUser(page);

        const header = new HeaderPage(page);
        await header.logout();

        await page.goto('/words');

        await expect(page).toHaveURL('/words');
        await expect(
            page.getByRole('heading', { name: 'Words' }),
        ).toBeVisible();
    });
});
