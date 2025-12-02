import { useCallback } from 'react';
import type { Stage5Settings } from '@/lib/training-settings';

type UseStage5SettingsParams = {
    updateSettings: (_settings: Stage5Settings) => void;
    currentSettings: Stage5Settings;
    setCurrentIndex: (_index: number) => void;
    setCurrentPhraseIndex: (_phraseIndex: number) => void;
    setIsFirstCard: (_value: boolean) => void;
};

export function useStage5Settings({
    updateSettings,
    currentSettings,
    setCurrentIndex,
    setCurrentPhraseIndex,
    setIsFirstCard,
}: UseStage5SettingsParams) {
    const handleSettingsChange = useCallback(
        (newSettings: Partial<Stage5Settings>) => {
            updateSettings({ ...currentSettings, ...newSettings });
            // Сбрасываем прогресс при изменении количества предложений
            setCurrentIndex(0);
            setCurrentPhraseIndex(0);
            setIsFirstCard(true);
        },
        [
            updateSettings,
            currentSettings,
            setCurrentIndex,
            setCurrentPhraseIndex,
            setIsFirstCard,
        ],
    );

    return {
        handleSettingsChange,
    };
}
