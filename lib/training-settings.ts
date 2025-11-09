/**
 * Утилиты для работы с настройками тренировки в localStorage с привязкой к userId
 */

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
    stage1: {
        showExamples: false,
    },
    stage4: {
        difficulty: 'easy',
    },
    stage5: {
        sentencesPerWord: 1,
    },
    stagesSettingsExpanded: true,
};

/**
 * Получить ключ для localStorage с привязкой к userId
 */
const getStorageKey = (userId: string, key: string): string => {
    return `training_${userId}_${key}`;
};

/**
 * Получить все настройки тренировки для пользователя
 */
export const getTrainingSettings = (userId: string): TrainingSettings => {
    if (typeof window === 'undefined') {
        return DEFAULT_SETTINGS;
    }

    try {
        const savedSettings = localStorage.getItem(
            getStorageKey(userId, 'settings'),
        );
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            // Мерджим с дефолтными настройками на случай если добавились новые поля
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

/**
 * Сохранить все настройки тренировки
 */
export const saveTrainingSettings = (
    userId: string,
    settings: TrainingSettings,
): void => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(
            getStorageKey(userId, 'settings'),
            JSON.stringify(settings),
        );
    } catch (error) {
        console.error('Error saving training settings:', error);
    }
};

/**
 * Получить настройки 1 этапа
 */
export const getStage1Settings = (userId: string): Stage1Settings => {
    const settings = getTrainingSettings(userId);
    return settings.stage1;
};

/**
 * Сохранить настройки 1 этапа
 */
export const saveStage1Settings = (
    userId: string,
    stage1Settings: Stage1Settings,
): void => {
    const settings = getTrainingSettings(userId);
    saveTrainingSettings(userId, { ...settings, stage1: stage1Settings });
};

/**
 * Получить настройки 4 этапа
 */
export const getStage4Settings = (userId: string): Stage4Settings => {
    const settings = getTrainingSettings(userId);
    return settings.stage4;
};

/**
 * Сохранить настройки 4 этапа
 */
export const saveStage4Settings = (
    userId: string,
    stage4Settings: Stage4Settings,
): void => {
    const settings = getTrainingSettings(userId);
    saveTrainingSettings(userId, { ...settings, stage4: stage4Settings });
};

/**
 * Получить настройки 5 этапа
 */
export const getStage5Settings = (userId: string): Stage5Settings => {
    const settings = getTrainingSettings(userId);
    return settings.stage5;
};

/**
 * Сохранить настройки 5 этапа
 */
export const saveStage5Settings = (
    userId: string,
    stage5Settings: Stage5Settings,
): void => {
    const settings = getTrainingSettings(userId);
    saveTrainingSettings(userId, { ...settings, stage5: stage5Settings });
};

/**
 * Получить выбранные этапы
 */
export const getEnabledStages = (userId: string): number[] => {
    const settings = getTrainingSettings(userId);
    return settings.enabledStages;
};

/**
 * Сохранить выбранные этапы
 */
export const saveEnabledStages = (
    userId: string,
    enabledStages: number[],
): void => {
    const settings = getTrainingSettings(userId);
    saveTrainingSettings(userId, { ...settings, enabledStages });
};

/**
 * Получить состояние развернутости настроек этапов
 */
export const getStagesSettingsExpanded = (userId: string): boolean => {
    const settings = getTrainingSettings(userId);
    return settings.stagesSettingsExpanded;
};

/**
 * Сохранить состояние развернутости настроек этапов
 */
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

/**
 * Получить выбранные слова для тренировки (устаревший метод для совместимости)
 */
export const getSelectedWords = (userId: string): string[] => {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const saved = localStorage.getItem(
            getStorageKey(userId, 'selected-words'),
        );
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading selected words:', error);
    }

    return [];
};

/**
 * Сохранить выбранные слова для тренировки (устаревший метод для совместимости)
 */
export const saveSelectedWords = (userId: string, wordIds: string[]): void => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(
            getStorageKey(userId, 'selected-words'),
            JSON.stringify(wordIds),
        );
    } catch (error) {
        console.error('Error saving selected words:', error);
    }
};

/**
 * Получить выбранный язык для тренировки (устаревший метод для совместимости)
 */
export const getSelectedLanguage = (userId: string): string => {
    if (typeof window === 'undefined') {
        return 'ALL';
    }

    try {
        const saved = localStorage.getItem(
            getStorageKey(userId, 'selected-language'),
        );
        if (saved) {
            return saved;
        }
    } catch (error) {
        console.error('Error loading selected language:', error);
    }

    return 'ALL';
};

/**
 * Сохранить выбранный язык для тренировки (устаревший метод для совместимости)
 */
export const saveSelectedLanguage = (
    userId: string,
    language: string,
): void => {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(
            getStorageKey(userId, 'selected-language'),
            language,
        );
    } catch (error) {
        console.error('Error saving selected language:', error);
    }
};
