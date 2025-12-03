import { useCallback, useMemo } from 'react';
import {
    useStage1Settings,
    useStage4Settings,
    useStage5Settings,
} from '@/hooks/shared/use-training-settings';
import { useHashDialog } from '@/hooks/shared';

type StageWithSettings = 1 | 4 | 5;

export const useStageModals = () => {
    const { open: stage1Open, setOpen: setStage1Open } = useHashDialog(
        'setup-stage1-settings',
    );
    const { open: stage4Open, setOpen: setStage4Open } = useHashDialog(
        'setup-stage4-settings',
    );
    const { open: stage5Open, setOpen: setStage5Open } = useHashDialog(
        'setup-stage5-settings',
    );

    const openModal = useMemo((): StageWithSettings | null => {
        if (stage1Open) return 1;
        if (stage4Open) return 4;
        if (stage5Open) return 5;
        return null;
    }, [stage1Open, stage4Open, stage5Open]);

    const stage1 = useStage1Settings();
    const stage4 = useStage4Settings();
    const stage5 = useStage5Settings();

    const openStageModal = useCallback(
        (stage: StageWithSettings) => {
            if (stage === 1) setStage1Open(true);
            else if (stage === 4) setStage4Open(true);
            else if (stage === 5) setStage5Open(true);
        },
        [setStage1Open, setStage4Open, setStage5Open],
    );

    const closeModal = useCallback(() => {
        setStage1Open(false);
        setStage4Open(false);
        setStage5Open(false);
    }, [setStage1Open, setStage4Open, setStage5Open]);

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
