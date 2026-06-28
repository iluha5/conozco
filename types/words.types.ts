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
    baseWord?: BaseWord & {
        wordGroups?: Array<{
            wordGroupId: number;
        }>;
    };
};

export type WordsFilter = {
    language: string;
    status: string;
    groupIds?: number[];
};

export type WordsStats = {
    total: number;
    notLearned: number;
    learned: number;
};

export type WordListItem = {
    id: number;
    status: WordStatus;
    language: { code: string; name: string };
    customWord?: string;
    baseWord?: {
        word: string;
        translations: Array<{
            translation: string;
            priority?: number;
            partOfSpeech?: { name: string };
        }>;
        translationsCount?: number;
        wordGroups?: Array<{ wordGroupId: number }>;
    };
    customTranslations?: Array<{
        translation: string;
        partOfSpeech?: { name: string };
        partOfSpeechId?: number | null;
    }>;
};

export type WordsListResponse = {
    items: WordListItem[];
    totalCount: number;
    limit: number;
    offset: number;
    hasMore: boolean;
};

export type WordsListStatus = 'ALL' | 'NOT_LEARNED' | 'LEARNED';

export type WordChangedEvent =
    | {
          action: 'add';
          item: WordListItem;
          wordGroupIds?: number[];
      }
    | { action: 'remove'; wordId: number };

export type SetupWord = {
    id: number;
    createdAt: string;
    status: 'NOT_LEARNED';
    customWord?: string;
    language: {
        code: string;
    };
    baseWord?: {
        word: string;
        translations: Array<{ translation: string }>;
        wordGroups: Array<{ wordGroupId: number }>;
    };
    customTranslations?: Array<{ translation: string }>;
};
