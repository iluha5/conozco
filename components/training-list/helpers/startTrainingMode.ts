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
import { tServerSync } from '@/lib/i18n/utils/tServerSync';

// IMPORTANT: this function is responsible for persisting training config to
// localStorage. When a training is paused these settings are picked up by
// SavedTrainingState.
export async function startTrainingMode(
    modeId: TrainingModeId,
    config: TrainingModeConfig,
    userId: string,
    currentLanguageId: number,
    allWords: Word[],
    router: any,
    setSelectedWords: (_words: Set<string>) => void,
    toast: (_options: any) => void,
    onFlashCardsOpen?: (_params: FlashCardsReviewParams) => void,
    onGroupSetupOpen?: () => void,
    lang: string = 'en',
    options?: { isGuest?: boolean },
): Promise<{ success: boolean; noWords?: boolean }> {
    const isGuest = options?.isGuest ?? false;

    if (modeId === 'custom') {
        if (isGuest) {
            return { success: false };
        }
        router.push('/training/setup');
        return { success: true };
    }

    if (config.modeType === 'flashCards') {
        if (modeId === 'learned-group-check') {
            onGroupSetupOpen?.();
            return { success: true };
        }

        if (config.groupId) {
            if (!isGuest) {
                const groupInfo = await checkGroupAvailability(config.groupId);

                if (!groupInfo.found || !groupInfo.isActive) {
                    const activated = await activateGroup(config.groupId);

                    if (!activated) {
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
            }

            const params: FlashCardsReviewParams = {
                source: 'base',
                groupIds: [config.groupId],
                limit: config.wordCount,
                random: true,
                selectedGroupName: config.groupName,
                readOnly: isGuest,
            };

            onFlashCardsOpen?.(params);
            return { success: true };
        }

        const params: FlashCardsReviewParams = {
            status: 'LEARNED',
            limit: config.wordCount,
            random: true,
            readOnly: isGuest,
        };

        onFlashCardsOpen?.(params);
        return { success: true };
    }

    if (isGuest) {
        return { success: false };
    }

    const wordStatus =
        config.wordSource === 'learned' ? 'LEARNED' : 'NOT_LEARNED';

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

async function activateGroup(groupId: number): Promise<boolean> {
    try {
        const response = await fetch(
            `/api/user/word-groups/${groupId}/activate`,
            {
                method: 'POST',
            },
        );

        // 400 means group is already activated; treat as success
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
