import { TrainingModeGroupId } from '../types/typing';

import { getNewWordsTrainingModes } from './training-modes';
import { getLearnedTrainingModes } from './learned-training-modes';
import { getTestTrainingModes } from './test-training-modes';
import { I18n } from '@/lib/i18n';

export const getTrainingModeGroups = (t: I18n['t']) => ({
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
