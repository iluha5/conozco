import { TrainingModeId, TrainingModeConfig } from '../types/typing';
import { getNewWordsTrainingModes } from '../constants/training-modes';
import { getLearnedTrainingModes } from '../constants/learned-training-modes';
import { getTestTrainingModes } from '../constants/test-training-modes';
import { I18n } from '@/lib/i18n';

/**
 * Найти конфигурацию режима тренировки по ID
 */
export function getTrainingModeConfig(
    modeId: TrainingModeId,
    t: I18n['t'],
): TrainingModeConfig | undefined {
    const allTrainingModes: TrainingModeConfig[] = [
        ...getNewWordsTrainingModes(t),
        ...getLearnedTrainingModes(t),
        ...getTestTrainingModes(t),
    ];

    return allTrainingModes.find(mode => mode.id === modeId);
}
