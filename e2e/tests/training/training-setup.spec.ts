import { test } from '@playwright/test';
import { TrainingSetupPage } from '../../page-objects/TrainingSetupPage';
import {
    createAndLoginUser,
    cleanupTestDatabase,
    createTestWord,
    createTestBaseWord,
} from '../../fixtures';
import { generateUniqueEmail } from '../../utils/test-helpers';

/**
 * Training setup tests (simplified)
 */
test.describe('Training - Setup', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('loads training setup page', async ({ page }) => {
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

        const trainingSetupPage = new TrainingSetupPage(page);
        await trainingSetupPage.goto();
        await trainingSetupPage.expectPageLoaded();

        // Simplified check: page loaded successfully
        await trainingSetupPage.waitForLoading();
    });

    test('displays training setup page', async ({ page }) => {
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

        const trainingSetupPage = new TrainingSetupPage(page);
        await trainingSetupPage.goto();
        await trainingSetupPage.expectPageLoaded();

        // Simplified check: page loaded successfully
        await trainingSetupPage.waitForLoading();
    });
});
