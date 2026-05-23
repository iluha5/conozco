export type Stage1Settings = {
    showExamples: boolean;
};

export type Stage4Settings = {
    difficulty: 'easy' | 'medium' | 'hard';
};

export type Stage5Settings = {
    sentencesPerWord: number;
};

export type TrainingSettings = {
    enabledStages: number[];
    stage1: Stage1Settings;
    stage4: Stage4Settings;
    stage5: Stage5Settings;
    stagesSettingsExpanded: boolean;
};

const DEFAULT_SETTINGS: TrainingSettings = {
    enabledStages: [1, 2, 3, 4, 5, 6],
    stage1: { showExamples: false },
    stage4: { difficulty: 'easy' },
    stage5: { sentencesPerWord: 1 },
    stagesSettingsExpanded: true,
};

const getStorageKey = (userId: string, key: string): string => {
    return `training_${userId}_${key}`;
};

export const getTrainingSettings = (userId: string): TrainingSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;

    try {
        const savedSettings = localStorage.getItem(
            getStorageKey(userId, 'settings'),
        );
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            // Shallow-merge with defaults so newly added fields fall back gracefully.
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                stage1: { ...DEFAULT_SETTINGS.stage1, ...parsed.stage1 },
                stage4: { ...DEFAULT_SETTINGS.stage4, ...parsed.stage4 },
                stage5: { ...DEFAULT_SETTINGS.stage5, ...parsed.stage5 },
            };
        }
    } catch (error) {
        console.error('Error loading training settings:', error);
    }

    return DEFAULT_SETTINGS;
};

export const saveTrainingSettings = (
    userId: string,
    settings: TrainingSettings,
): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(
            getStorageKey(userId, 'settings'),
            JSON.stringify(settings),
        );
    } catch (error) {
        console.error('Error saving training settings:', error);
    }
};

export const getStage1Settings = (userId: string): Stage1Settings => {
    return getTrainingSettings(userId).stage1;
};

export const saveStage1Settings = (
    userId: string,
    stage1Settings: Stage1Settings,
): void => {
    const settings = getTrainingSettings(userId);
    saveTrainingSettings(userId, { ...settings, stage1: stage1Settings });
};

export const getStage4Settings = (userId: string): Stage4Settings => {
    return getTrainingSettings(userId).stage4;
};

export const saveStage4Settings = (
    userId: string,
    stage4Settings: Stage4Settings,
): void => {
    const settings = getTrainingSettings(userId);
    saveTrainingSettings(userId, { ...settings, stage4: stage4Settings });
};

export const getStage5Settings = (userId: string): Stage5Settings => {
    return getTrainingSettings(userId).stage5;
};

export const saveStage5Settings = (
    userId: string,
    stage5Settings: Stage5Settings,
): void => {
    const settings = getTrainingSettings(userId);
    saveTrainingSettings(userId, { ...settings, stage5: stage5Settings });
};

export const saveEnabledStages = (
    userId: string,
    enabledStages: number[],
): void => {
    const settings = getTrainingSettings(userId);
    saveTrainingSettings(userId, { ...settings, enabledStages });
};

export const saveStagesSettingsExpanded = (
    userId: string,
    expanded: boolean,
): void => {
    const settings = getTrainingSettings(userId);
    saveTrainingSettings(userId, {
        ...settings,
        stagesSettingsExpanded: expanded,
    });
};

// Legacy keys kept for back-compat with TrainingWordsContext.
export const getSelectedWords = (userId: string): string[] => {
    if (typeof window === 'undefined') return [];

    try {
        const saved = localStorage.getItem(
            getStorageKey(userId, 'selected-words'),
        );
        if (saved) return JSON.parse(saved);
    } catch (error) {
        console.error('Error loading selected words:', error);
    }

    return [];
};

export const saveSelectedWords = (userId: string, wordIds: string[]): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(
            getStorageKey(userId, 'selected-words'),
            JSON.stringify(wordIds),
        );
    } catch (error) {
        console.error('Error saving selected words:', error);
    }
};

export const getSelectedLanguage = (userId: string): string => {
    if (typeof window === 'undefined') return 'ALL';

    try {
        const saved = localStorage.getItem(
            getStorageKey(userId, 'selected-language'),
        );
        if (saved) return saved;
    } catch (error) {
        console.error('Error loading selected language:', error);
    }

    return 'ALL';
};

export const saveSelectedLanguage = (
    userId: string,
    language: string,
): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(
            getStorageKey(userId, 'selected-language'),
            language,
        );
    } catch (error) {
        console.error('Error saving selected language:', error);
    }
};
