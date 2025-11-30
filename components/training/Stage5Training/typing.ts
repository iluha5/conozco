export type Language = {
    id: string;
    code: string;
    name: string;
};

export type Word = {
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
};

export type Stage5Props = {
    words: Word[];
    onComplete: () => void;
};

export type Phrase = {
    example: string;
    translation: string;
    pronoun: string;
    words: string[];
};

export type WordState = {
    word: string;
    selected: boolean;
};
