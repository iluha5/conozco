import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    getTrainingSettings,
    saveTrainingSettings,
    getStage1Settings,
    saveStage1Settings,
    getStage4Settings,
    saveStage4Settings,
    getStage5Settings,
    saveStage5Settings,
    type Stage1Settings,
    type Stage4Settings,
    type Stage5Settings,
    type TrainingSettings,
} from '@/lib/training-settings';

export function useTrainingSettings() {
    const { data: session } = useSession();
    const [isLoaded, setIsLoaded] = useState(false);
    const [settings, setSettings] = useState<TrainingSettings | null>(null);

    useEffect(() => {
        if (session?.user?.id) {
            const loadedSettings = getTrainingSettings(session.user.id);
            setSettings(loadedSettings);
            setIsLoaded(true);
        }
    }, [session]);

    useEffect(() => {
        if (session?.user?.id && isLoaded && settings) {
            saveTrainingSettings(session.user.id, settings);
        }
    }, [settings, session, isLoaded]);

    const updateEnabledStages = (stages: number[]) => {
        if (settings) {
            setSettings({ ...settings, enabledStages: stages });
        }
    };

    const updateStage1Settings = (stage1: Stage1Settings) => {
        if (settings) {
            setSettings({ ...settings, stage1 });
        }
    };

    const updateStage4Settings = (stage4: Stage4Settings) => {
        if (settings) {
            setSettings({ ...settings, stage4 });
        }
    };

    const updateStage5Settings = (stage5: Stage5Settings) => {
        if (settings) {
            setSettings({ ...settings, stage5 });
        }
    };

    const updateStagesSettingsExpanded = (expanded: boolean) => {
        if (settings) {
            setSettings({ ...settings, stagesSettingsExpanded: expanded });
        }
    };

    return {
        settings,
        isLoaded,
        updateEnabledStages,
        updateStage1Settings,
        updateStage4Settings,
        updateStage5Settings,
        updateStagesSettingsExpanded,
        userId: session?.user?.id,
    };
}

export function useStage1Settings() {
    const { data: session } = useSession();
    const [settings, setSettings] = useState<Stage1Settings>({
        showExamples: false,
    });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            const loaded = getStage1Settings(session.user.id);
            setSettings(loaded);
            setIsLoaded(true);
        }
    }, [session]);

    const updateSettings = (newSettings: Stage1Settings) => {
        setSettings(newSettings);
        if (session?.user?.id) {
            saveStage1Settings(session.user.id, newSettings);
        }
    };

    return {
        settings,
        updateSettings,
        isLoaded,
        userId: session?.user?.id,
    };
}

export function useStage4Settings() {
    const { data: session } = useSession();
    const [settings, setSettings] = useState<Stage4Settings>({
        difficulty: 'easy',
    });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            const loaded = getStage4Settings(session.user.id);
            setSettings(loaded);
            setIsLoaded(true);
        }
    }, [session]);

    const updateSettings = (newSettings: Stage4Settings) => {
        setSettings(newSettings);
        if (session?.user?.id) {
            saveStage4Settings(session.user.id, newSettings);
        }
    };

    return {
        settings,
        updateSettings,
        isLoaded,
        userId: session?.user?.id,
    };
}

export function useStage5Settings() {
    const { data: session } = useSession();
    const [settings, setSettings] = useState<Stage5Settings>({
        sentencesPerWord: 1,
    });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            const loaded = getStage5Settings(session.user.id);
            setSettings(loaded);
            setIsLoaded(true);
        }
    }, [session]);

    const updateSettings = (newSettings: Stage5Settings) => {
        setSettings(newSettings);
        if (session?.user?.id) {
            saveStage5Settings(session.user.id, newSettings);
        }
    };

    return {
        settings,
        updateSettings,
        isLoaded,
        userId: session?.user?.id,
    };
}

export function useTrainingSelection() {
    const { data: session } = useSession();
    const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            const savedLanguage = localStorage.getItem(
                `training_${session.user.id}_selected-language`,
            );
            if (savedLanguage) {
                setSelectedLanguage(savedLanguage);
            }
            setIsLoaded(true);
        }
    }, [session]);

    useEffect(() => {
        if (session?.user?.id && isLoaded) {
            localStorage.setItem(
                `training_${session.user.id}_selected-language`,
                selectedLanguage,
            );
        }
    }, [selectedLanguage, session, isLoaded]);

    return {
        selectedLanguage,
        setSelectedLanguage,
        isLoaded,
        userId: session?.user?.id,
    };
}
