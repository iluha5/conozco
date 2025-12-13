import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Тесты этапа 6 тренировки - Составление слова по голосу
 */
test.describe('Тренировки - Этап 6', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('загрузка и запуск этапа 6 тренировки', async ({ page }) => {
        const { trainingPage } = await setupTrainingWithWords(page);
        await openTrainingStage(page, 6, trainingPage);
        await trainingPage.expectStageLoaded(6, STAGE_TITLES[6]);
    });
});
