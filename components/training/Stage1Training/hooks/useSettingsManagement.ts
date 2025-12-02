import { useCallback } from 'react';
import type { Stage1Settings } from '@/lib/training-settings';

type UseSettingsManagementParams = {
    updateSettings: (_settings: Stage1Settings) => void;
    currentSettings: Stage1Settings;
};

export function useSettingsManagement({
    updateSettings,
    currentSettings,
}: UseSettingsManagementParams) {
    const handleSettingsChange = useCallback(
        (newSettings: Partial<Stage1Settings>) => {
            updateSettings({ ...currentSettings, ...newSettings });
        },
        [updateSettings, currentSettings],
    );

    return {
        handleSettingsChange,
    };
}
