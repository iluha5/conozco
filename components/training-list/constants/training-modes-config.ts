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
