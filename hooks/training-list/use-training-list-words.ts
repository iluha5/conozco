import { useQuery } from '@tanstack/react-query';
import { Word } from '@/types/training.types';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';
import { trainingApi } from '@/lib/api/training.api';

const EMPTY_WORDS: Word[] = [];

export function useTrainingListWords(languageCode: string | null) {
    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ['training-list-words', languageCode],
        queryFn: async () => {
            if (!languageCode) return EMPTY_WORDS;
            return trainingApi.fetchWords(undefined, languageCode);
        },
        enabled: !!languageCode,
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
        refetchOnMount: true,
    });

    const words = data ?? EMPTY_WORDS;

    if (error) {
        console.error('Error fetching training list words:', error);
    }

    return {
        words,
        isLoading: isLoading && !data,
        isFetching,
    };
}
