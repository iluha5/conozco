import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Training stage 2 tests — select correct translation from options
 */
test.describe('Training - Stage 2', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('loads and runs training stage 2', async ({ page }) => {
        const { trainingPage } = await setupTrainingWithWords(page);
        await openTrainingStage(page, 2, trainingPage);
        await trainingPage.expectStageLoaded(2, STAGE_TITLES[2]);
    });
});
