import { Word, SavedTrainingState } from '@/types/training.types';
import { SetupWord } from '@/types/words.types';

export interface TrainingStats {
    notLearnedCount: number;
    learnedCount: number;
    totalCount: number;
}

export interface FetchTrainingWordsBySelectionParams {
    limit: number;
    status: 'NOT_LEARNED' | 'LEARNED';
    selection?: 'latest' | 'random';
    languageCode?: string;
}

export interface FetchTrainingWordsByIdsParams {
    wordIds: string[];
}

export type FetchTrainingWordsParams =
    | FetchTrainingWordsBySelectionParams
    | FetchTrainingWordsByIdsParams;

export interface FetchSetupWordsParams {
    languageCode: string;
    groupIds?: number[];
    limit?: number;
}

function isByIdsParams(
    params: FetchTrainingWordsParams,
): params is FetchTrainingWordsByIdsParams {
    return 'wordIds' in params;
}

export const trainingApi = {
    fetchTrainingStats: async (
        languageCode?: string,
    ): Promise<TrainingStats> => {
        const params = new URLSearchParams();
        if (languageCode) {
            params.set('languageCode', languageCode);
        }
        const queryString = params.toString();
        const url = queryString
            ? `/api/training/stats?${queryString}`
            : '/api/training/stats';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch training stats');
        }

        return response.json();
    },

    fetchTrainingWords: async (
        params: FetchTrainingWordsParams,
    ): Promise<Word[]> => {
        const searchParams = new URLSearchParams();

        if (isByIdsParams(params)) {
            if (params.wordIds.length === 0) {
                return [];
            }
            searchParams.set('wordIds', params.wordIds.join(','));
        } else {
            searchParams.set('limit', String(params.limit));
            searchParams.set('status', params.status);
            searchParams.set('selection', params.selection || 'latest');
            if (params.languageCode) {
                searchParams.set('languageCode', params.languageCode);
            }
        }

        const response = await fetch(
            `/api/training/words?${searchParams.toString()}`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch training words');
        }

        return response.json();
    },

    fetchSetupWords: async (
        params: FetchSetupWordsParams,
    ): Promise<SetupWord[]> => {
        const searchParams = new URLSearchParams();
        searchParams.set('languageCode', params.languageCode);
        if (params.groupIds && params.groupIds.length > 0) {
            searchParams.set('groupIds', params.groupIds.join(','));
        }
        if (params.limit) {
            searchParams.set('limit', String(params.limit));
        }

        const response = await fetch(
            `/api/training/setup-words?${searchParams.toString()}`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch setup words');
        }

        return response.json();
    },

    fetchWords: async (
        status?: string,
        languageCode?: string,
    ): Promise<Word[]> => {
        const params = new URLSearchParams();
        if (status) params.set('status', status);
        if (languageCode) params.set('languageCode', languageCode);
        const queryString = params.toString();
        const url = queryString ? `/api/words?${queryString}` : '/api/words';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch words');
        }

        return response.json();
    },

    markWordAsLearned: async (wordId: string): Promise<Word> => {
        const response = await fetch(`/api/words/${wordId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'LEARNED' }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update word ${wordId}`);
        }

        return response.json();
    },

    markWordsAsLearned: async (wordIds: string[]): Promise<Word[]> => {
        return Promise.all(
            wordIds.map(id => trainingApi.markWordAsLearned(id)),
        );
    },

    saveTrainingLog: async (savedState: SavedTrainingState): Promise<void> => {
        const response = await fetch('/api/training-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ savedState }),
        });

        if (!response.ok) {
            throw new Error('Failed to save training log');
        }
    },
};
