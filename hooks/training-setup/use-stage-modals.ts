import { useState, useCallback } from 'react';
import {
    useStage1Settings,
    useStage4Settings,
    useStage5Settings,
} from '@/hooks/shared/use-training-settings';

type StageWithSettings = 1 | 4 | 5;

export const useStageModals = () => {
    const [openModal, setOpenModal] = useState<StageWithSettings | null>(null);

    const stage1 = useStage1Settings();
    const stage4 = useStage4Settings();
    const stage5 = useStage5Settings();

    const openStageModal = useCallback((stage: StageWithSettings) => {
        setOpenModal(stage);
    }, []);

    const closeModal = useCallback(() => {
        setOpenModal(null);
    }, []);

    const handleStage1Change = useCallback(
        (newSettings: Partial<typeof stage1.settings>) => {
            stage1.updateSettings({ ...stage1.settings, ...newSettings });
        },
        [stage1],
    );

    const handleStage4Change = useCallback(
        (newSettings: Partial<typeof stage4.settings>) => {
            stage4.updateSettings({ ...stage4.settings, ...newSettings });
        },
        [stage4],
    );

    const handleStage5Change = useCallback(
        (newSettings: Partial<typeof stage5.settings>) => {
            stage5.updateSettings({ ...stage5.settings, ...newSettings });
        },
        [stage5],
    );

    return {
        openModal,
        openStageModal,
        closeModal,
        handleStage1Change,
        handleStage4Change,
        handleStage5Change,
        settings: {
            stage1: stage1.settings,
            stage4: stage4.settings,
            stage5: stage5.settings,
        },
    };
};
