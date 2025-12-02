import { useCallback } from 'react';
import type { Stage4Settings } from '@/lib/training-settings';

type UseStage4SettingsParams = {
    updateSettings: (_settings: Stage4Settings) => void;
    currentSettings: Stage4Settings;
    setCurrentIndex: (_index: number) => void;
    setIsFirstCard: (_value: boolean) => void;
};

export function useStage4Settings({
    updateSettings,
    currentSettings,
    setCurrentIndex,
    setIsFirstCard,
}: UseStage4SettingsParams) {
    const handleSettingsChange = useCallback(
        (newSettings: Partial<Stage4Settings>) => {
            updateSettings({ ...currentSettings, ...newSettings });
            // Сбрасываем прогресс при изменении сложности
            setCurrentIndex(0);
            setIsFirstCard(true);
        },
        [updateSettings, currentSettings, setCurrentIndex, setIsFirstCard],
    );

    return {
        handleSettingsChange,
    };
}
