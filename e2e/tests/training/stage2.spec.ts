import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Тесты этапа 2 тренировки - Выбор правильного перевода из вариантов
 */
test.describe('Тренировки - Этап 2', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('загрузка и запуск этапа 2 тренировки', async ({ page }) => {
        const { trainingPage } = await setupTrainingWithWords(page);
        await openTrainingStage(page, 2, trainingPage);
        await trainingPage.expectStageLoaded(2, STAGE_TITLES[2]);
    });
});
