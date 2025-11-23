export type WordStatus = 'NOT_LEARNED' | 'LEARNED';

export type Language = {
    id: number;
    code: string;
    name: string;
};

export type BaseWord = {
    id: number;
    word: string;
    languageId: number;
    translations: Array<{
        translation: string;
        priority: number;
        partOfSpeech?: {
            id: number;
            name: string;
            displayName: string;
        };
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
};

export type Word = {
    id: number;
    userId: number;
    baseWordId?: number;
    customWord?: string;
    languageId: number;
    language: Language;
    status: WordStatus;
    createdAt: string;
    updatedAt: string;
    baseWord?: BaseWord;
};

export type WordsFilter = {
    language: string;
    status: string;
};

export type WordsStats = {
    total: number;
    notLearned: number;
    learned: number;
};
