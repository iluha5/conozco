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
import { tServerSync } from '@/lib/i18n';

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
    // New parameters for consolidation modes
    onFlashCardsOpen?: (_params: FlashCardsReviewParams) => void,
    onGroupSetupOpen?: () => void,
    lang: string = 'en',
): Promise<{ success: boolean; noWords?: boolean }> {
    // Custom mode → /training/setup
    if (modeId === 'custom') {
        router.push('/training/setup');
        return { success: true };
    }

    // FlashCards mode (quick-check, A1 tests)
    if (config.modeType === 'flashCards') {
        if (modeId === 'learned-group-check') {
            // Open group selection dialog
            onGroupSetupOpen?.();
            return { success: true };
        }

        // Group modes (A1 tests)
        if (config.groupId) {
            // Check group availability and activation via API
            const groupInfo = await checkGroupAvailability(config.groupId);

            // If group found but not activated, or not found at all
            if (!groupInfo.found || !groupInfo.isActive) {
                // Try to automatically activate group
                const activated = await activateGroup(config.groupId);

                if (!activated) {
                    // If activation failed, show error
                    toast({
                        title: tServerSync('Group unavailable', lang),
                        description: tServerSync(
                            'Group "{{name}}" is unavailable. Add it in "Word groups" section.',
                            lang,
                            { name: config.groupName || 'A1' },
                        ),
                        variant: 'destructive',
                    });
                    return { success: false };
                }

                // Show notification about automatic group addition only if group was not activated
                if (!groupInfo.isActive) {
                    toast({
                        title: tServerSync(
                            'Group "{{name}}" has been automatically added to your word groups',
                            lang,
                            { name: config.groupName || 'A1' },
                        ),
                        description: '',
                        variant: 'default',
                        duration: 3000,
                    });
                }
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

        // Quick check of learned
        const params: FlashCardsReviewParams = {
            status: 'LEARNED',
            limit: config.wordCount,
            random: true,
        };

        onFlashCardsOpen?.(params);
        return { success: true };
    }

    // Training mode (sentences for learned or standard)
    const wordStatus =
        config.wordSource === 'learned' ? 'LEARNED' : 'NOT_LEARNED';

    // Filter words by status
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
            title: tServerSync('Not enough words', lang),
            description: tServerSync(
                'Required {{required}} words, only {{available}} available. Training will start with available words.',
                lang,
                {
                    required: config.wordCount,
                    available: selectedWordsList.length,
                },
            ),
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

    // Save word source for training page
    sessionStorage.setItem(STORAGE_KEYS.TRAINING_WORD_SOURCE, wordStatus);
    sessionStorage.setItem(STORAGE_KEYS.TRAINING_FROM_SETUP, 'true');

    localStorage.removeItem(STORAGE_KEYS.TRAINING_PROGRESS);

    router.push('/training');

    return { success: true };
}

/**
 * Хелпер для проверки доступности и активации группы
 * Возвращает объект с информацией о группе
 */
async function checkGroupAvailability(groupId: number): Promise<{
    found: boolean;
    isActive: boolean;
}> {
    try {
        const response = await fetch('/api/user/word-groups/all-accessible');
        if (!response.ok) {
            return { found: false, isActive: false };
        }

        const groups = await response.json();
        const group = groups.find((g: any) => g.id === groupId);

        if (!group) {
            return { found: false, isActive: false };
        }

        return {
            found: true,
            isActive: group.isActive || false,
        };
    } catch (error) {
        console.error('Error checking group availability:', error);
        return { found: false, isActive: false };
    }
}

/**
 * Хелпер для активации группы через API
 */
async function activateGroup(groupId: number): Promise<boolean> {
    try {
        const response = await fetch(
            `/api/user/word-groups/${groupId}/activate`,
            {
                method: 'POST',
            },
        );

        // If group already activated (400), consider it success
        if (response.status === 400) {
            return true;
        }

        if (!response.ok) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error activating group:', error);
        return false;
    }
}
