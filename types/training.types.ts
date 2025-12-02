export type TrainingStage = 1 | 2 | 3 | 4 | 5 | 6;

export type StageStatus = 'pending' | 'in_progress' | 'completed';

export interface Language {
    id: string;
    code: string;
    name: string;
}

export interface Word {
    id: string;
    userId: string;
    baseWordId?: string;
    customWord?: string;
    languageId: string;
    language: Language;
    status: 'NOT_LEARNED' | 'LEARNED';
    createdAt: string;
    updatedAt: string;
    baseWord?: {
        id: string;
        word: string;
        partOfSpeech: {
            id: string;
            name: string;
            displayName: string;
        };
        languageId: string;
        translations: Array<{
            translation: string;
            priority: number;
        }>;
        examples: Array<{
            example: string;
            translation: string;
            pronoun: {
                pronoun: string;
            };
            translationLanguage?: {
                id: number;
                code: string;
                name: string;
            } | null;
            sentenceType?: {
                id: number;
                code: string;
                displayName: string;
                isNegative: boolean;
                isQuestion: boolean;
            };
        }>;
        grammaticalExamples: Array<{
            example: string;
            translation: string;
            pronoun: {
                pronoun: string;
            };
            tense: {
                name: string;
            };
            sentenceType?: {
                id: number;
                code: string;
                displayName: string;
                isNegative: boolean;
                isQuestion: boolean;
            };
        }>;
    };
    customTranslations?: Array<{
        id: number;
        translation: string;
        partOfSpeech?: {
            id: number;
            name: string;
            displayName: string;
        };
        partOfSpeechId?: number | null;
        originalLanguage: Language;
        translationLanguage: Language;
    }>;
    trainingSessions: Array<{
        id: string;
        stage: number;
        isCorrect: boolean;
        createdAt: string;
    }>;
}

export interface TrainingState {
    currentStage: TrainingStage;
    trainingWords: Word[];
    completedWords: Word[];
    isCompleted: boolean;
    isLoading: boolean;
}

export interface StageCompletionResult {
    nextStage?: TrainingStage;
    completed: boolean;
    learnedWords?: Word[];
}

export const STAGE_NAMES: Record<TrainingStage, string> = {
    1: 'Просмотр + озвучка',
    2: 'Выбор перевода',
    3: 'Сопоставление',
    4: 'Составление слова',
    5: 'Составление предложения',
    6: 'Составление по голосу',
};

// ===== Расширенные типы для сохранения прогресса =====

/**
 * Прогресс по одному слову в этапе
 */
export interface WordProgress {
    wordId: string;
    isCompleted: boolean;
    attempts: number; // общее количество попыток
    correctAttempts: number; // количество правильных попыток
    lastAttemptAt?: string;
}

/**
 * Прогресс по этапу тренировки
 */
export interface StageProgress {
    stage: TrainingStage;
    status: StageStatus;
    wordsProgress: WordProgress[];
    currentWordIndex: number;
    completedAt?: string;
}

/**
 * Настройки этапов (если они есть)
 */
export interface StageSettings {
    stage1?: {
        showTranslation: boolean;
        autoPlayAudio: boolean;
    };
    stage4?: {
        showHints: boolean;
    };
    stage5?: {
        wordOrder: 'sequential' | 'random';
    };
}

/**
 * Сохраненное состояние тренировки в localStorage
 */
export interface SavedTrainingState {
    sessionId: string; // Уникальный ID сессии тренировки
    startedAt: string;
    lastUpdatedAt: string;

    // Настройки тренировки
    enabledStages: TrainingStage[];
    stageSettings: StageSettings;
    selectedLanguage: string;
    selectedWordIds: string[];

    // Текущий прогресс
    currentStage: TrainingStage;
    stagesProgress: StageProgress[];

    // Метаданные
    totalWords: number;
    completedWords: number;
}

/**
 * Лог тренировки для сохранения в БД
 */
export interface TrainingLog {
    id?: string;
    userId: string;
    sessionId: string;
    startedAt: Date;
    completedAt: Date;
    duration: number; // в секундах

    // Настройки
    enabledStages: number[];
    selectedLanguage: string;
    totalWords: number;

    // Результаты
    completedWords: number;
    stagesProgress: StageProgress[];

    // Статистика
    totalAttempts: number;
    correctAttempts: number;
    accuracy: number; // процент правильных ответов
}
