import { useQuery } from '@tanstack/react-query';
import { trainingApi, TrainingStats } from '@/lib/api/training.api';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';

const EMPTY_STATS: TrainingStats = {
    notLearnedCount: 0,
    learnedCount: 0,
    totalCount: 0,
};

export function useWordsPageStats(languageCode: string | null) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['training-stats', languageCode],
        queryFn: async () => {
            if (!languageCode) {
                return EMPTY_STATS;
            }
            return trainingApi.fetchTrainingStats(languageCode);
        },
        enabled: !!languageCode,
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
    });

    const stats = data ?? EMPTY_STATS;

    if (error) {
        console.error('Error fetching words page stats:', error);
    }

    return {
        stats: {
            total: stats.totalCount,
            notLearned: stats.notLearnedCount,
            learned: stats.learnedCount,
        },
        isLoading,
    };
}
