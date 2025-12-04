import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Word } from '@/types/words.types';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';

const EMPTY_WORDS: Word[] = [];

async function fetchWords(): Promise<Word[]> {
    const response = await fetch('/api/words');

    if (!response.ok) {
        throw new Error('Failed to fetch words');
    }

    return response.json();
}

/**
 * Хук для загрузки всех слов пользователя с кэшированием через React Query
 */
export const useWordsData = () => {
    const queryClient = useQueryClient();

    const {
        data,
        isLoading: loading,
        error,
        refetch: queryRefetch,
    } = useQuery({
        queryKey: ['words'],
        queryFn: fetchWords,
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
    });

    // Используем стабильную ссылку на пустой массив
    const words = data ?? EMPTY_WORDS;

    // Показываем toast при ошибке
    if (error) {
        console.error('Error fetching words:', error);
    }

    // Обёртка для совместимости с существующим API
    const refetch = useCallback(async (): Promise<void> => {
        await queryRefetch();
    }, [queryRefetch]);

    // Оптимистичное обновление слова в кэше
    const updateWord = useCallback(
        (wordId: number, updates: Partial<Word>) => {
            queryClient.setQueryData<Word[]>(['words'], oldWords => {
                if (!oldWords) return [];

                return oldWords.map(word =>
                    word.id === wordId ? { ...word, ...updates } : word,
                );
            });

            // Также обновляем кэш для setup-words если он есть
            queryClient.setQueryData<Word[]>(
                ['words', { status: 'NOT_LEARNED', limit: 120 }],
                oldWords => {
                    if (!oldWords) return undefined;

                    return oldWords.map(word =>
                        word.id === wordId ? { ...word, ...updates } : word,
                    );
                },
            );
        },
        [queryClient],
    );

    // Оптимистичное удаление слова из кэша
    const removeWord = useCallback(
        (wordId: number) => {
            queryClient.setQueryData<Word[]>(['words'], oldWords => {
                if (!oldWords) return [];

                return oldWords.filter(word => word.id !== wordId);
            });

            // Также удаляем из кэша setup-words если он есть
            queryClient.setQueryData<Word[]>(
                ['words', { status: 'NOT_LEARNED', limit: 120 }],
                oldWords => {
                    if (!oldWords) return undefined;

                    return oldWords.filter(word => word.id !== wordId);
                },
            );
        },
        [queryClient],
    );

    return {
        words,
        loading,
        refetch,
        updateWord,
        removeWord,
    };
};
