import type { I18n } from '@/lib/i18n';
import type { TrainingStage } from '@/types/training.types';

export const getStageNames = (t: I18n['t']): Record<TrainingStage, string> => ({
    1: t('View and memorize'),
    2: t('Select correct translation'),
    3: t('Match words'),
    4: t('Word building from letters'),
    5: t('Build a sentence from words'),
    6: t('Build word from voice'),
});
