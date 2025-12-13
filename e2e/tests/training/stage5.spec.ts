import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Тесты этапа 5 тренировки - Составление предложения
 */
test.describe('Тренировки - Этап 5', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('загрузка и запуск этапа 5 тренировки', async ({ page }) => {
        const { trainingPage } = await setupTrainingWithWords(page);
        await openTrainingStage(page, 5, trainingPage);
        await trainingPage.expectStageLoaded(5, STAGE_TITLES[5]);
    });
});
