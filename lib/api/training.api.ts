import { Word } from '@/types/training.types';

export const trainingApi = {
    /**
     * Получить список слов
     * @param status - Опциональный статус слов для фильтрации
     */
    fetchWords: async (status?: string): Promise<Word[]> => {
        const url = status ? `/api/words?status=${status}` : '/api/words';
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
};
