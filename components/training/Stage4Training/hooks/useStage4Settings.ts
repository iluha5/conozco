import { useCallback } from 'react';
import type { Stage4Settings } from '@/lib/training-settings';

type UseStage4SettingsParams = {
    updateSettings: (_settings: Stage4Settings) => void;
    setShowSettingsModal: (_show: boolean) => void;
    setCurrentIndex: (_index: number) => void;
    setIsFirstCard: (_value: boolean) => void;
};

export function useStage4Settings({
    updateSettings,
    setShowSettingsModal,
    setCurrentIndex,
    setIsFirstCard,
}: UseStage4SettingsParams) {
    const handleSettingsChange = useCallback(
        (newSettings: Stage4Settings) => {
            updateSettings(newSettings);
            setShowSettingsModal(false);
            // Сбрасываем прогресс при изменении сложности
            setCurrentIndex(0);
            setIsFirstCard(true);
        },
        [updateSettings, setShowSettingsModal, setCurrentIndex, setIsFirstCard],
    );

    return {
        handleSettingsChange,
    };
}
