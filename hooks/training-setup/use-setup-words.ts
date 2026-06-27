import { useQuery } from '@tanstack/react-query';
import { SetupWord } from '@/types/words.types';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';
import { trainingApi } from '@/lib/api/training.api';

const EMPTY_WORDS: SetupWord[] = [];

export const useSetupWords = (
    languageCode: string,
    selectedGroupIds: number[] = [],
) => {
    const { data, isLoading, error } = useQuery({
        queryKey: [
            'training-setup-words',
            { languageCode, groupIds: selectedGroupIds },
        ],
        queryFn: async () => {
            if (!languageCode || languageCode === 'ALL') {
                return EMPTY_WORDS;
            }
            return trainingApi.fetchSetupWords({
                languageCode,
                groupIds:
                    selectedGroupIds.length > 0 ? selectedGroupIds : undefined,
            });
        },
        enabled: !!languageCode && languageCode !== 'ALL',
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
    });

    const filteredWords = data ?? EMPTY_WORDS;

    if (error) {
        console.error('Error fetching setup words:', error);
    }

    return {
        words: filteredWords,
        filteredWords,
        isLoading,
    };
};
