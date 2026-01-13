import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import { trainingApi } from '@/lib/api/training.api';
import {
    Word,
    StageCompletionResult,
    TrainingStage,
    StageProgress,
} from '@/types/training.types';

/**
 * Хук с бизнес-логикой тренировки
 */
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

            // Check if all enabled stages will be completed after current
            const allStagesCompleted = stages.every(stage => {
                const progress = stagesProgress.find(sp => sp.stage === stage);
                // Stage is considered completed if already completed or this is current stage
                return (
                    progress?.status === 'completed' || stage === currentStage
                );
            });

            // If all stages completed - training finished
            if (allStagesCompleted) {
                // All stages completed - mark words as learned
                try {
                    await trainingApi.markWordsAsLearned(
                        trainingWords.map(w => w.id),
                    );

                    // Invalidate React Query cache to update word lists
                    // This ensures that on next opening /training/setup
                    // current data will be loaded without already learned words
                    await queryClient.invalidateQueries({
                        queryKey: ['words'],
                    });
                    await queryClient.invalidateQueries({
                        queryKey: [
                            'words',
                            { status: 'NOT_LEARNED', limit: 120 },
                        ],
                    });

                    // Get updated word list
                    const allWords = await trainingApi.fetchWords();
                    const trainedWordIds = trainingWords.map(w => w.id);
                    const learnedWords = allWords.filter(w =>
                        trainedWordIds.includes(w.id),
                    );

                    toast({
                        description: `Выучено слов: ${learnedWords.length}`,
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

            // Not all stages completed - find next unfinished
            // First check next stage in order
            const currentIndex = stages.indexOf(currentStage);
            if (currentIndex < stages.length - 1) {
                const nextStage = stages[currentIndex + 1] as TrainingStage;
                const nextProgress = stagesProgress.find(
                    sp => sp.stage === nextStage,
                );

                // If next stage not yet completed - move to it
                if (nextProgress?.status !== 'completed') {
                    return {
                        nextStage,
                        completed: false,
                    };
                }
            }

            // Next stage already completed or we are on last stage
            // Find any unfinished stage
            return {
                completed: false,
            };
        },
        [queryClient, toast, t],
    );

    return { handleStageComplete };
}
