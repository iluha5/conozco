import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import { trainingApi } from '@/lib/api/training.api';
import { clearTrainingWordsCache } from '@/lib/training-words-cache';
import {
    Word,
    StageCompletionResult,
    TrainingStage,
    StageProgress,
} from '@/types/training.types';

export function useTrainingLogic() {
    const { toast } = useToast();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const handleStageComplete = useCallback(
        async (
            currentStage: TrainingStage,
            enabledStages: Set<TrainingStage>,
            trainingWords: Word[],
            stagesProgress: StageProgress[],
        ): Promise<StageCompletionResult> => {
            const stages = Array.from(enabledStages).sort();

            const allStagesCompleted = stages.every(stage => {
                const progress = stagesProgress.find(sp => sp.stage === stage);
                return (
                    progress?.status === 'completed' || stage === currentStage
                );
            });

            if (allStagesCompleted) {
                try {
                    const learnedWords = await trainingApi.markWordsAsLearned(
                        trainingWords.map(word => word.id),
                    );

                    await queryClient.invalidateQueries({
                        queryKey: ['words'],
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['words-list'],
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['training-stats'],
                    });
                    await queryClient.invalidateQueries({
                        queryKey: [
                            'words',
                            { status: 'NOT_LEARNED', limit: 120 },
                        ],
                    });

                    clearTrainingWordsCache();

                    toast({
                        description: t('Words learned: {{count}}', {
                            count: trainingWords.length,
                        }),
                        variant: 'success',
                    });

                    return {
                        completed: true,
                        learnedWords,
                    };
                } catch (error) {
                    console.error('Error marking words as learned:', error);
                    toast({
                        title: t('Error'),
                        description: t('Failed to mark words as learned'),
                        variant: 'destructive',
                    });
                    throw error;
                }
            }

            const currentIndex = stages.indexOf(currentStage);
            if (currentIndex < stages.length - 1) {
                const nextStage = stages[currentIndex + 1] as TrainingStage;
                const nextProgress = stagesProgress.find(
                    sp => sp.stage === nextStage,
                );

                if (nextProgress?.status !== 'completed') {
                    return { nextStage, completed: false };
                }
            }

            return { completed: false };
        },
        [queryClient, toast, t],
    );

    return { handleStageComplete };
}
