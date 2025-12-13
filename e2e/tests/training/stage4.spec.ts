import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Тесты этапа 4 тренировки - Составление слова из букв
 */
test.describe('Тренировки - Этап 4', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('загрузка и запуск этапа 4 тренировки', async ({ page }) => {
        const { trainingPage } = await setupTrainingWithWords(page);
        await openTrainingStage(page, 4, trainingPage);
        await trainingPage.expectStageLoaded(4, STAGE_TITLES[4]);
    });
});
