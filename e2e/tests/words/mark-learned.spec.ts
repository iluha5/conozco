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
 * Word status change tests (simplified)
 */
test.describe('Words - Change status', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('loads words page with a single word', async ({ page }) => {
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

        // Create word with NOT_LEARNED status
        await createTestWord(user.id, {
            baseWordId: baseWord.id,
            languageCode: 'en',
            statusCode: 'NOT_LEARNED',
        });

        const wordsPage = new WordsPage(page);
        await wordsPage.goto();
        await wordsPage.expectPageLoaded();

        // Simplified check: page loaded
        await wordsPage.waitForLoading();
    });

    test('loads words page with multiple words', async ({ page }) => {
        // Create and log in user
        const user = await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'password123',
        });

        // Create multiple base words
        const baseWord1 = await createTestBaseWord(
            'hello',
            'en',
            'привет',
            'ru',
        );
        const baseWord2 = await createTestBaseWord('world', 'en', 'мир', 'ru');
        if (!baseWord1 || !baseWord2)
            throw new Error('Failed to create base words');

        // Create words with different statuses
        await createTestWord(user.id, {
            baseWordId: baseWord1.id,
            languageCode: 'en',
            statusCode: 'NOT_LEARNED',
        });
        await createTestWord(user.id, {
            baseWordId: baseWord2.id,
            languageCode: 'en',
            statusCode: 'LEARNED',
        });

        const wordsPage = new WordsPage(page);
        await wordsPage.goto();
        await wordsPage.expectPageLoaded();

        // Simplified check: page loaded
        await wordsPage.waitForLoading();
    });
});
