import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Training stage 4 tests — build word from letters
 */
test.describe('Training - Stage 4', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('loads and runs training stage 4', async ({ page }) => {
        const { trainingPage } = await setupTrainingWithWords(page);
        await openTrainingStage(page, 4, trainingPage);
        await trainingPage.expectStageLoaded(4, STAGE_TITLES[4]);
    });
});
