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
import { FlashCardsReviewParams } from '@/components/flash-cards-review/typing';

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
    // Новые параметры для режимов закрепления
    onFlashCardsOpen?: (_params: FlashCardsReviewParams) => void,
    onGroupSetupOpen?: () => void,
): Promise<{ success: boolean; noWords?: boolean }> {
    // Режим custom → /training/setup
    if (modeId === 'custom') {
        router.push('/training/setup');
        return { success: true };
    }

    // Режим с FlashCards (quick-check, A1 тесты)
    if (config.modeType === 'flashCards') {
        if (modeId === 'learned-group-check') {
            // Открываем диалог выбора группы
            onGroupSetupOpen?.();
            return { success: true };
        }

        // Режимы с группой (A1 тесты)
        if (config.groupId) {
            // Проверяем доступность группы через API
            const isAvailable = await checkGroupAvailability(config.groupId);

            if (!isAvailable) {
                toast({
                    title: 'Группа недоступна',
                    description: `Группа "${config.groupName || 'A1'}" недоступна. Добавьте её в разделе "Группы слов".`,
                    variant: 'destructive',
                });
                return { success: false };
            }

            const params: FlashCardsReviewParams = {
                source: 'base',
                groupIds: [config.groupId],
                limit: config.wordCount,
                random: true,
                selectedGroupName: config.groupName,
            };

            onFlashCardsOpen?.(params);
            return { success: true };
        }

        // Быстрая проверка изученных
        const params: FlashCardsReviewParams = {
            status: 'LEARNED',
            limit: config.wordCount,
            random: true,
        };

        onFlashCardsOpen?.(params);
        return { success: true };
    }

    // Режим training (sentences для изученных или стандартные)
    const wordStatus =
        config.wordSource === 'learned' ? 'LEARNED' : 'NOT_LEARNED';

    // Фильтруем слова по статусу
    const filteredWords = allWords.filter(
        word =>
            Number(word.languageId) === currentLanguageId &&
            word.status === wordStatus,
    );

    const selectedWordsList = getLastAddedWords(
        filteredWords,
        currentLanguageId,
        config.wordCount,
        wordStatus,
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

    // Сохраняем источник слов для training page
    sessionStorage.setItem(STORAGE_KEYS.TRAINING_WORD_SOURCE, wordStatus);
    sessionStorage.setItem(STORAGE_KEYS.TRAINING_FROM_SETUP, 'true');

    localStorage.removeItem(STORAGE_KEYS.TRAINING_PROGRESS);

    router.push('/training');

    return { success: true };
}

/**
 * Хелпер для проверки доступности группы
 */
async function checkGroupAvailability(groupId: number): Promise<boolean> {
    try {
        const response = await fetch('/api/user/word-groups/all-accessible');
        if (!response.ok) return false;

        const groups = await response.json();
        const group = groups.find((g: any) => g.id === groupId);

        return !!group;
    } catch (error) {
        console.error('Error checking group availability:', error);
        return false;
    }
}
