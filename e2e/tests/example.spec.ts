import { test, expect } from '@playwright/test';
import { HeaderPage } from '../page-objects/Header';
import { createAndLoginUser, cleanupTestDatabase } from '../fixtures';
import { generateUniqueEmail } from '../utils/test-helpers';
import { DEFAULT_TEST_VALUES } from '../utils/constants';

/**
 * Example test to verify Playwright configuration
 */
test.describe('Fixture usage examples', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('demonstrates auth fixture usage', async ({ page }) => {
        const user = await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: DEFAULT_TEST_VALUES.PASSWORD,
            name: 'Test User',
        });

        await expect(page).toHaveURL('/training/list');

        const header = new HeaderPage(page);
        await header.expectAuthenticatedState(user.email);

        expect(user.id).toBeGreaterThan(0);
        expect(user.email).toContain('@example.com');
    });
});
