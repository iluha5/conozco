/**
 * Типы для компонента AddWordDialog
 */

export type PartOfSpeech = {
    id: string;
    name: string;
    displayName: string;
};

export type BaseWord = {
    id: string;
    word: string;
    language: {
        code: string;
        name: string;
    };
    translations: Array<{
        translation: string;
        priority: number;
        partOfSpeech?: PartOfSpeech;
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
    isAddedByUser: boolean;
    customTranslations?: Array<{
        id: number;
        translation: string;
        partOfSpeech?: {
            id: number;
            name: string;
            displayName: string;
        };
        partOfSpeechId?: number | null;
        originalLanguage: {
            id: number;
            code: string;
            name: string;
        };
        translationLanguage: {
            id: number;
            code: string;
            name: string;
        };
    }>;
};

export type SelectedWord = string; // baseWordId
