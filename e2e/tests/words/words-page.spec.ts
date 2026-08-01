import { test } from '@playwright/test';
import { WordsPage } from '../../page-objects/WordsPage';
import { AddWordDialogPage } from '../../page-objects/AddWordDialogPage';
import {
    createAndLoginUser,
    cleanupTestDatabase,
    createTestBaseWord,
    createTestWord,
} from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Words page smoke tests
 */
test.describe('Words - Page', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('shows seeded word on words page', async ({ page }) => {
        const user = await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'password123',
        });

        const baseWord = await createTestBaseWord(
            'hello',
            'en',
            'привет',
            'ru',
        );
        if (!baseWord) {
            throw new Error('Failed to create base word');
        }

        await createTestWord(user.id, {
            baseWordId: baseWord.id,
            languageCode: 'en',
        });

        const wordsPage = new WordsPage(page);
        await wordsPage.goto();
        await wordsPage.expectPageLoaded();
        await wordsPage.expectWordInList('hello');
    });

    test('opens add-word dialog', async ({ page }) => {
        await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: 'password123',
        });

        const wordsPage = new WordsPage(page);
        await wordsPage.goto();
        await wordsPage.expectPageLoaded();
        await wordsPage.clickAddWord();

        const addWordDialog = new AddWordDialogPage(page);
        await addWordDialog.expectDialogOpen();
    });
});
