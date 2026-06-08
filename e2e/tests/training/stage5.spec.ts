import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Training stage 5 tests — build sentence from words
 */
test.describe('Training - Stage 5', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('loads and runs training stage 5', async ({ page }) => {
        // Create word with example sentences for stage 5
        const { trainingPage } = await setupTrainingWithWords(page, [
            {
                word: 'hello',
                translation: 'привет',
                examples: [
                    {
                        example: 'Hello world',
                        translation: 'Привет мир',
                        pronoun: 'I',
                    },
                    {
                        example: 'Say hello',
                        translation: 'Скажи привет',
                        pronoun: 'you',
                    },
                ],
            },
        ]);
        await openTrainingStage(page, 5, trainingPage);
        await trainingPage.expectStageLoaded(5, STAGE_TITLES[5]);
    });
});
