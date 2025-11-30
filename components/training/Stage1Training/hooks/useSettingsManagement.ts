import { useCallback } from 'react';
import type { Stage1Settings } from '@/lib/training-settings';

type UseSettingsManagementParams = {
    updateSettings: (_settings: Stage1Settings) => void;
    setShowSettingsModal: (_show: boolean) => void;
};

export function useSettingsManagement({
    updateSettings,
    setShowSettingsModal,
}: UseSettingsManagementParams) {
    const handleSettingsChange = useCallback(
        (newSettings: Stage1Settings) => {
            updateSettings(newSettings);
            setShowSettingsModal(false);
        },
        [updateSettings, setShowSettingsModal],
    );

    return {
        handleSettingsChange,
    };
}
