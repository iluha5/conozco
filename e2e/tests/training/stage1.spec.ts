import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Тесты этапа 1 тренировки - Просмотр слова с озвучкой и переводом (упрощенные)
 */
test.describe('Тренировки - Этап 1', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('загрузка этапа 1 тренировки', async ({ page }) => {
        const { trainingPage } = await setupTrainingWithWords(page);
        await openTrainingStage(page, 1, trainingPage);
        await trainingPage.expectStageLoaded(1, STAGE_TITLES[1]);
    });
});
