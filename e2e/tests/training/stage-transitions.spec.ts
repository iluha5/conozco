import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Training stage transition tests
 */
test.describe('Training - Stage transitions', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('transitions from stage 2 to stage 3', async ({ page }) => {
        // Create training with a single word
        const { trainingPage } = await setupTrainingWithWords(page, [
            { word: 'hello', translation: 'привет' },
        ]);

        // Open stage 2
        await openTrainingStage(page, 2, trainingPage);
        await trainingPage.expectStageLoaded(2, STAGE_TITLES[2]);

        // Select correct translation
        await trainingPage.selectCorrectTranslationStage2('привет');

        // Wait for transition to stage 3
        await trainingPage.expectStageTitle(STAGE_TITLES[3], {
            timeout: 10000,
        });

        // Assert we are on stage 3
        await trainingPage.expectStage(3);
        await trainingPage.expectStageLoaded(3, STAGE_TITLES[3]);
    });

    test('transitions from stage 3 to stage 4', async ({ page }) => {
        // Create training with a single word
        const { trainingPage } = await setupTrainingWithWords(page, [
            { word: 'hello', translation: 'привет' },
        ]);

        // Open stage 3
        await openTrainingStage(page, 3, trainingPage);
        await trainingPage.expectStageLoaded(3, STAGE_TITLES[3]);

        // Match all pairs
        await trainingPage.matchAllPairsStage3();

        // Wait for transition to stage 4
        await trainingPage.expectStageTitle(STAGE_TITLES[4], {
            timeout: 10000,
        });

        // Assert we are on stage 4
        await trainingPage.expectStage(4);
        await trainingPage.expectStageLoaded(4, STAGE_TITLES[4]);
    });

    test('transitions from stage 4 to stage 5', async ({ page }) => {
        // Create training with a single word
        const { trainingPage } = await setupTrainingWithWords(page, [
            { word: 'hello', translation: 'привет' },
        ]);

        // Open stage 4
        await openTrainingStage(page, 4, trainingPage);
        await trainingPage.expectStageLoaded(4, STAGE_TITLES[4]);

        // Build word from letters
        await trainingPage.buildWordStage4('hello');

        // Wait for transition to stage 5
        await trainingPage.expectStageTitle(STAGE_TITLES[5], {
            timeout: 10000,
        });

        // Assert we are on stage 5
        await trainingPage.expectStage(5);
        await trainingPage.expectStageLoaded(5, STAGE_TITLES[5]);
    });

    test('transitions from stage 5 to stage 6', async ({ page }) => {
        // Create training with one word and example sentences
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
                ],
            },
        ]);

        // Open stage 5
        await openTrainingStage(page, 5, trainingPage);
        await trainingPage.expectStageLoaded(5, STAGE_TITLES[5]);

        // Build sentence (words in correct order)
        await trainingPage.buildSentenceStage5(['Hello', 'world']);

        // Wait for transition to stage 6
        await trainingPage.expectStageTitle(STAGE_TITLES[6], {
            timeout: 10000,
        });

        // Assert we are on stage 6
        await trainingPage.expectStage(6);
        await trainingPage.expectStageLoaded(6, STAGE_TITLES[6]);
    });
});
