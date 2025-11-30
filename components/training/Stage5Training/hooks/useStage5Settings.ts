import { useCallback } from 'react';
import type { Stage5Settings } from '@/lib/training-settings';

type UseStage5SettingsParams = {
    updateSettings: (_settings: Stage5Settings) => void;
    setShowSettingsModal: (_show: boolean) => void;
    setCurrentIndex: (_index: number) => void;
    setCurrentPhraseIndex: (_phraseIndex: number) => void;
    setIsFirstCard: (_value: boolean) => void;
};

export function useStage5Settings({
    updateSettings,
    setShowSettingsModal,
    setCurrentIndex,
    setCurrentPhraseIndex,
    setIsFirstCard,
}: UseStage5SettingsParams) {
    const handleSettingsChange = useCallback(
        (newSettings: Stage5Settings) => {
            updateSettings(newSettings);
            setShowSettingsModal(false);
            // Сбрасываем прогресс при изменении количества предложений
            setCurrentIndex(0);
            setCurrentPhraseIndex(0);
            setIsFirstCard(true);
        },
        [
            updateSettings,
            setShowSettingsModal,
            setCurrentIndex,
            setCurrentPhraseIndex,
            setIsFirstCard,
        ],
    );

    return {
        handleSettingsChange,
    };
}
