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

    const words = data ?? EMPTY_WORDS;

    if (error) {
        console.error('Error fetching words:', error);
    }

    const refetch = useCallback(async (): Promise<void> => {
        await queryRefetch();
    }, [queryRefetch]);

    const updateWord = useCallback(
        (wordId: number, updates: Partial<Word>) => {
            queryClient.setQueryData<Word[]>(['words'], oldWords => {
                if (!oldWords) return [];
                return oldWords.map(word =>
                    word.id === wordId ? { ...word, ...updates } : word,
                );
            });

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

    const removeWord = useCallback(
        (wordId: number) => {
            queryClient.setQueryData<Word[]>(['words'], oldWords => {
                if (!oldWords) return [];
                return oldWords.filter(word => word.id !== wordId);
            });

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
