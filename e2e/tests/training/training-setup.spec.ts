import { test } from '@playwright/test';
import { TrainingSetupPage } from '../../page-objects/TrainingSetupPage';
import {
    createAndLoginUser,
    cleanupTestDatabase,
    createTestWord,
    createTestBaseWord,
} from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';
import { DEFAULT_TEST_VALUES } from '../../utils/constants';

/**
 * Training setup tests
 */
test.describe('Training - Setup', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('loads training setup page', async ({ page }) => {
        const user = await createAndLoginUser(page, {
            email: generateUniqueEmail(),
            password: DEFAULT_TEST_VALUES.PASSWORD,
        });

        const baseWord = await createTestBaseWord(
            'hello',
            'en',
            'привет',
            'ru',
        );
        if (!baseWord) throw new Error('Failed to create base word');

        await createTestWord(user.id, {
            baseWordId: baseWord.id,
            languageCode: 'en',
        });

        const trainingSetupPage = new TrainingSetupPage(page);
        await trainingSetupPage.goto();
        await trainingSetupPage.expectPageLoaded();
        await trainingSetupPage.waitForLoading();
    });
});
