import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Training stage 6 tests — build word from audio
 */
test.describe('Training - Stage 6', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('loads and runs training stage 6', async ({ page }) => {
        const { trainingPage } = await setupTrainingWithWords(page);
        await openTrainingStage(page, 6, trainingPage);
        await trainingPage.expectStageLoaded(6, STAGE_TITLES[6]);
    });
});
