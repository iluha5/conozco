import { Word, SavedTrainingState } from '@/types/training.types';

export const trainingApi = {
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
