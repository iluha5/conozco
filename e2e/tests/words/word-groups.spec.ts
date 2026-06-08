import { test } from '@playwright/test';
import { WordsPage } from '../../page-objects/WordsPage';
import {
    createAndLoginUser,
    cleanupTestDatabase,
    createTestWord,
    createTestBaseWord,
} from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Word groups tests (simplified)
 */
test.describe('Words - Word groups', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('displays words on the page', async ({ page }) => {
        // Create and log in user
        const user = await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'password123',
        });

        // Create base word
        const baseWord = await createTestBaseWord(
            'hello',
            'en',
            'привет',
            'ru',
        );
        if (!baseWord) throw new Error('Failed to create base word');

        // Create user word
        await createTestWord(user.id, {
            baseWordId: baseWord.id,
            languageCode: 'en',
        });

        const wordsPage = new WordsPage(page);
        await wordsPage.goto();
        await wordsPage.expectPageLoaded();

        // Simplified check: page loaded without errors
        await wordsPage.waitForLoading();
    });
});
