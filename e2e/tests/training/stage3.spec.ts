import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Training stage 3 tests — match words
 */
test.describe('Training - Stage 3', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('loads and runs training stage 3', async ({ page }) => {
        const { trainingPage } = await setupTrainingWithWords(page);
        await openTrainingStage(page, 3, trainingPage);
        await trainingPage.expectStageLoaded(3, STAGE_TITLES[3]);
    });
});
