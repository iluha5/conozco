import { test } from '@playwright/test';
import { HeaderPage } from '../../page-objects/Header';
import { WordsPage } from '../../page-objects/WordsPage';
import { createAndLoginUser, cleanupTestDatabase } from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';
import { DEFAULT_TEST_VALUES } from '../../utils/constants';

/**
 * Logout tests
 */
test.describe('Auth - Logout', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('logs out successfully', async ({ page }) => {
        const email = generateUniqueEmail();
        await createAndLoginUser(page, {
            email,
            password: DEFAULT_TEST_VALUES.PASSWORD,
        });

        const header = new HeaderPage(page);
        await header.expectAuthenticatedState(email);

        await header.logout();

        await header.expectGuestState();
    });

    test('shows guest words page after logout', async ({ page }) => {
        await createAndLoginUser(page);

        const header = new HeaderPage(page);
        await header.logout();

        const wordsPage = new WordsPage(page);
        await wordsPage.goto();
        await wordsPage.expectGuestPageLoaded();
    });
});
