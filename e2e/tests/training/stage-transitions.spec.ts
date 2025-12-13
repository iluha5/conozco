import { test } from '@playwright/test';
import {
    cleanupTestDatabase,
    setupTrainingWithWords,
    openTrainingStage,
} from '../../fixtures';
import { STAGE_TITLES } from '../../utils/training-constants';

/**
 * Тесты переходов между этапами тренировки
 */
test.describe('Тренировки - Переходы между этапами', () => {
    test.beforeEach(async () => {
        await cleanupTestDatabase();
    });

    test('переход с этапа 2 на этап 3', async ({ page }) => {
        // Создаем тренировку с одним словом
        const { trainingPage } = await setupTrainingWithWords(page, [
            { word: 'hello', translation: 'привет' },
        ]);

        // Открываем этап 2
        await openTrainingStage(page, 2, trainingPage);
        await trainingPage.expectStageLoaded(2, STAGE_TITLES[2]);

        // Выбираем правильный перевод
        await trainingPage.selectCorrectTranslationStage2('привет');

        // Ждем перехода на этап 3
        await trainingPage.expectStageTitle(STAGE_TITLES[3], {
            timeout: 10000,
        });

        // Проверяем, что мы действительно на этапе 3
        await trainingPage.expectStage(3);
        await trainingPage.expectStageLoaded(3, STAGE_TITLES[3]);
    });

    test('переход с этапа 3 на этап 4', async ({ page }) => {
        // Создаем тренировку с одним словом
        const { trainingPage } = await setupTrainingWithWords(page, [
            { word: 'hello', translation: 'привет' },
        ]);

        // Открываем этап 3
        await openTrainingStage(page, 3, trainingPage);
        await trainingPage.expectStageLoaded(3, STAGE_TITLES[3]);

        // Сопоставляем все пары
        await trainingPage.matchAllPairsStage3();

        // Ждем перехода на этап 4
        await trainingPage.expectStageTitle(STAGE_TITLES[4], {
            timeout: 10000,
        });

        // Проверяем, что мы действительно на этапе 4
        await trainingPage.expectStage(4);
        await trainingPage.expectStageLoaded(4, STAGE_TITLES[4]);
    });

    test('переход с этапа 4 на этап 5', async ({ page }) => {
        // Создаем тренировку с одним словом
        const { trainingPage } = await setupTrainingWithWords(page, [
            { word: 'hello', translation: 'привет' },
        ]);

        // Открываем этап 4
        await openTrainingStage(page, 4, trainingPage);
        await trainingPage.expectStageLoaded(4, STAGE_TITLES[4]);

        // Составляем слово по буквам
        await trainingPage.buildWordStage4('hello');

        // Ждем перехода на этап 5
        await trainingPage.expectStageTitle(STAGE_TITLES[5], {
            timeout: 10000,
        });

        // Проверяем, что мы действительно на этапе 5
        await trainingPage.expectStage(5);
        await trainingPage.expectStageLoaded(5, STAGE_TITLES[5]);
    });

    test('переход с этапа 5 на этап 6', async ({ page }) => {
        // Создаем тренировку с одним словом и примерами предложений
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

        // Открываем этап 5
        await openTrainingStage(page, 5, trainingPage);
        await trainingPage.expectStageLoaded(5, STAGE_TITLES[5]);

        // Составляем предложение (слова в правильном порядке)
        await trainingPage.buildSentenceStage5(['Hello', 'world']);

        // Ждем перехода на этап 6
        await trainingPage.expectStageTitle(STAGE_TITLES[6], {
            timeout: 10000,
        });

        // Проверяем, что мы действительно на этапе 6
        await trainingPage.expectStage(6);
        await trainingPage.expectStageLoaded(6, STAGE_TITLES[6]);
    });
});
