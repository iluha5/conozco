import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { TrainingStats, trainingApi } from '@/lib/api/training.api';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';

const EMPTY_STATS: TrainingStats = {
    notLearnedCount: 0,
    learnedCount: 0,
    totalCount: 0,
};

export function useTrainingListStats(languageCode: string | null) {
    const { status } = useSession();
    const isAuthenticated = status === 'authenticated';

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ['training-stats', languageCode],
        queryFn: async () => {
            if (!languageCode) {
                return EMPTY_STATS;
            }
            return trainingApi.fetchTrainingStats(languageCode);
        },
        enabled: !!languageCode && isAuthenticated,
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
        refetchOnMount: true,
    });

    const stats = data ?? EMPTY_STATS;

    if (error) {
        console.error('Error fetching training stats:', error);
    }

    return {
        stats,
        isLoading: isLoading && !data,
        isFetching,
    };
}
