import { TrainingModeId, TrainingModeConfig } from '../types/typing';
import { NEW_WORDS_TRAINING_MODES } from '../constants/training-modes';
import { LEARNED_TRAINING_MODES } from '../constants/learned-training-modes';

/**
 * Объединенный массив всех режимов тренировок
 */
const ALL_TRAINING_MODES: TrainingModeConfig[] = [
    ...NEW_WORDS_TRAINING_MODES,
    ...LEARNED_TRAINING_MODES,
];

/**
 * Найти конфигурацию режима тренировки по ID
 */
export function getTrainingModeConfig(
    modeId: TrainingModeId,
): TrainingModeConfig | undefined {
    return ALL_TRAINING_MODES.find(mode => mode.id === modeId);
}

