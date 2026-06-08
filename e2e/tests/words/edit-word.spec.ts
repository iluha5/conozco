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
 * Edit word tests (simplified)
 */
test.describe('Words - Edit word', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('loads words page for translation editing', async ({ page }) => {
        // Create and log in user
        const user = await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'password123',
        });

        // Create base word with translations
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
