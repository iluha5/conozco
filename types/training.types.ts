export type TrainingStage = 1 | 2 | 3 | 4 | 5 | 6;

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
