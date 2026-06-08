import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Training stage 1 tests — view word with audio and translation (simplified)
 */
test.describe('Training - Stage 1', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('loads training stage 1', async ({ page }) => {
        const { trainingPage } = await setupTrainingWithWords(page);
        await openTrainingStage(page, 1, trainingPage);
        await trainingPage.expectStageLoaded(1, STAGE_TITLES[1]);
    });

    test('completes stage 1 and transitions to stage 2', async ({ page }) => {
        // Create training with a single word
        const { trainingPage } = await setupTrainingWithWords(page, [
            { word: 'hello', translation: 'привет' },
        ]);

        // Open stage 1
        await openTrainingStage(page, 1, trainingPage);
        await trainingPage.expectStageLoaded(1, STAGE_TITLES[1]);

        // Show translation
        await trainingPage.showTranslationStage1();

        // Click next/finish (only one word in training)
        await trainingPage.clickNextStage1();

        // Wait for transition to stage 2
        await trainingPage.expectStageTitle(STAGE_TITLES[2], {
            timeout: 10000,
        });

        // Assert we are on stage 2
        await trainingPage.expectStage(2);
        await trainingPage.expectStageLoaded(2, STAGE_TITLES[2]);
    });
});
