export type Language = {
    id: string | number;
    code: string;
    name: string;
};

export type Word = {
    id: string | number;
    userId: string | number;
    baseWordId?: string | number;
    customWord?: string;
    languageId: string | number;
    language: Language;
    status: 'NOT_LEARNED' | 'LEARNED';
    createdAt: string;
    updatedAt: string;
    baseWord?: {
        id: string | number;
        word: string;
        languageId: string | number;
        translations: Array<{
            translation: string;
            priority: number;
            partOfSpeech?: {
                id: string | number;
                name: string;
                displayName: string;
            };
        }>;
        examples?: Array<any>;
        grammaticalExamples?: Array<any>;
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
    trainingSessions?: Array<any>;
};

export type WordUpdateCallback = (
    _wordId: string | number,
    _updates: Partial<Word>,
) => void;

export type WordRemoveCallback = (_wordId: string | number) => void;

export type WordsListProps = {
    words: Word[];
    onWordsChange?: () => Promise<void>;
    onWordUpdate?: WordUpdateCallback;
    onWordRemove?: WordRemoveCallback;
    showBulkActions?: boolean;
    readOnly?: boolean;
    emptyMessage?: string;
};
