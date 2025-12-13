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
        // Создаем слово с примерами предложений для этапа 5
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
