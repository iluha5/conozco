import { NEW_WORDS_TRAINING_MODES } from './training-modes';
import { LEARNED_TRAINING_MODES } from './learned-training-modes';
import { TEST_TRAINING_MODES } from './test-training-modes';
import { TrainingModeGroupId } from '../types/typing';

export const TRAINING_MODE_GROUPS = {
    new: {
        id: 'new' as TrainingModeGroupId,
        title: 'Новые слова',
        description: 'Тренировка неизученных слов',
        modes: NEW_WORDS_TRAINING_MODES,
    },
    learned: {
        id: 'learned' as TrainingModeGroupId,
        title: 'Закрепление',
        description: 'Повторение изученных слов',
        modes: LEARNED_TRAINING_MODES,
    },
    tests: {
        id: 'tests' as TrainingModeGroupId,
        title: 'Тесты',
        description: 'Проверка знаний через тесты',
        modes: TEST_TRAINING_MODES,
    },
};

import { getNewWordsTrainingModes } from './training-modes';
import { getLearnedTrainingModes } from './learned-training-modes';
import { getTestTrainingModes } from './test-training-modes';

export const getTrainingModeGroups = (
    t: (_key: string, _params?: Record<string, string | number>) => string,
) => ({
    new: {
        id: 'new' as TrainingModeGroupId,
        title: t('New words'),
        description: t('Training unlearned words'),
        modes: getNewWordsTrainingModes(t),
    },
    learned: {
        id: 'learned' as TrainingModeGroupId,
        title: t('Reinforcement'),
        description: t('Repeating learned words'),
        modes: getLearnedTrainingModes(t),
    },
    tests: {
        id: 'tests' as TrainingModeGroupId,
        title: t('Tests'),
        description: t('Knowledge testing through tests'),
        modes: getTestTrainingModes(t),
    },
});
