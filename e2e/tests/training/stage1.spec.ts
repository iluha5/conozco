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

    test('завершение этапа 1 и переход на этап 2', async ({ page }) => {
        // Создаем тренировку с одним словом
        const { trainingPage } = await setupTrainingWithWords(page, [
            { word: 'hello', translation: 'привет' },
        ]);

        // Открываем этап 1
        await openTrainingStage(page, 1, trainingPage);
        await trainingPage.expectStageLoaded(1, STAGE_TITLES[1]);

        // Показываем перевод
        await trainingPage.showTranslationStage1();

        // Нажимаем кнопку "Завершить" (так как это единственное слово)
        await trainingPage.clickNextStage1();

        // Ждем перехода на этап 2
        await trainingPage.expectStageTitle(STAGE_TITLES[2], {
            timeout: 10000,
        });

        // Проверяем, что мы действительно на этапе 2
        await trainingPage.expectStage(2);
        await trainingPage.expectStageLoaded(2, STAGE_TITLES[2]);
    });
});
