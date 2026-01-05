import { Word, SavedTrainingState } from '@/types/training.types';

export const trainingApi = {
    /**
     * Получить список слов
     * @param status - Опциональный статус слов для фильтрации
     * @param languageCode - Опциональный код языка для фильтрации
     */
    fetchWords: async (
        status?: string,
        languageCode?: string,
    ): Promise<Word[]> => {
        const params = new URLSearchParams();
        if (status) {
            params.set('status', status);
        }
        if (languageCode) {
            params.set('languageCode', languageCode);
        }
        const queryString = params.toString();
        const url = queryString ? `/api/words?${queryString}` : '/api/words';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch words');
        }

        return response.json();
    },

    /**
     * Отметить слово как выученное
     * @param wordId - ID слова
     */
    markWordAsLearned: async (wordId: string): Promise<Word> => {
        const response = await fetch(`/api/words/${wordId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'LEARNED' }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update word ${wordId}`);
        }

        return response.json();
    },

    /**
     * Отметить несколько слов как выученные
     * @param wordIds - Массив ID слов
     */
    markWordsAsLearned: async (wordIds: string[]): Promise<Word[]> => {
        const results = await Promise.all(
            wordIds.map(id => trainingApi.markWordAsLearned(id)),
        );
        return results;
    },

    /**
     * Сохранить лог завершенной тренировки в БД
     * @param savedState - Сохраненное состояние тренировки
     */
    saveTrainingLog: async (savedState: SavedTrainingState): Promise<void> => {
        const response = await fetch('/api/training-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ savedState }),
        });

        if (!response.ok) {
            throw new Error('Failed to save training log');
        }
    },
};
