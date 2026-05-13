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

export interface WordProgress {
    wordId: string;
    isCompleted: boolean;
    attempts: number;
    correctAttempts: number;
    lastAttemptAt?: string;
}

export interface StageProgress {
    stage: TrainingStage;
    status: StageStatus;
    wordsProgress: WordProgress[];
    currentWordIndex: number;
    completedAt?: string;
}

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

export interface SavedTrainingState {
    sessionId: string;
    startedAt: string;
    lastUpdatedAt: string;

    enabledStages: TrainingStage[];
    stageSettings: StageSettings;
    selectedLanguage: string;
    selectedWordIds: string[];

    currentStage: TrainingStage;
    stagesProgress: StageProgress[];

    totalWords: number;
    completedWords: number;
}

export interface TrainingLog {
    id?: string;
    userId: string;
    sessionId: string;
    startedAt: Date;
    completedAt: Date;
    duration: number;

    enabledStages: number[];
    selectedLanguage: string;
    totalWords: number;

    completedWords: number;
    stagesProgress: StageProgress[];

    totalAttempts: number;
    correctAttempts: number;
    accuracy: number;
}
