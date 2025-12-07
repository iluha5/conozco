import { TrainingModeId, TrainingModeConfig } from '../types/typing';
import { Word } from '@/types/training.types';
import { getLastAddedWords } from './prepareTrainingWords';
import {
    saveEnabledStages,
    saveStage1Settings,
    saveStage4Settings,
    saveStage5Settings,
} from '@/lib/training-settings';
import { STORAGE_KEYS } from '@/config/storage-keys';

/**
 * ВАЖНО: Эта функция отвечает за правильное сохранение конфигурации в localStorage
 * При паузе тренировки эти настройки будут сохранены в SavedTrainingState
 */
export async function startTrainingMode(
    modeId: TrainingModeId,
    config: TrainingModeConfig,
    userId: string,
    currentLanguageId: number,
    allWords: Word[],
    router: any,
    setSelectedWords: (_words: Set<string>) => void,
    toast: (_options: any) => void,
): Promise<{ success: boolean; noWords?: boolean }> {
    if (modeId === 'custom') {
        router.push('/training/setup');
        return { success: true };
    }

    const selectedWordsList = getLastAddedWords(
        allWords,
        currentLanguageId,
        config.wordCount,
    );

    if (selectedWordsList.length === 0) {
        return { success: false, noWords: true };
    }

    if (selectedWordsList.length < config.wordCount) {
        toast({
            title: 'Недостаточно слов',
            description: `Требуется ${config.wordCount} слов, доступно только ${selectedWordsList.length}. Тренировка будет запущена с доступными словами.`,
            variant: 'default',
        });
    }

    const wordIds = selectedWordsList.map(word => String(word.id));
    setSelectedWords(new Set(wordIds));

    saveEnabledStages(userId, config.enabledStages);

    if (config.settings.stage1) {
        saveStage1Settings(userId, config.settings.stage1);
    }

    if (config.settings.stage4) {
        saveStage4Settings(userId, config.settings.stage4);
    }

    if (config.settings.stage5) {
        saveStage5Settings(userId, config.settings.stage5);
    }

    sessionStorage.setItem(STORAGE_KEYS.TRAINING_FROM_SETUP, 'true');

    localStorage.removeItem(STORAGE_KEYS.TRAINING_PROGRESS);

    router.push('/training');

    return { success: true };
}
