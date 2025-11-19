import { useCallback } from 'react';
import { useToast } from '@/hooks/shared';
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

    const handleStageComplete = useCallback(
        async (
            currentStage: TrainingStage,
            enabledStages: Set<TrainingStage>,
            trainingWords: Word[],
            stagesProgress: StageProgress[],
        ): Promise<StageCompletionResult> => {
            const stages = Array.from(enabledStages).sort();

            // Проверяем, все ли включенные этапы будут завершены после текущего
            const allStagesCompleted = stages.every(stage => {
                const progress = stagesProgress.find(sp => sp.stage === stage);
                // Этап считается завершенным, если он уже completed или это текущий этап
                return (
                    progress?.status === 'completed' || stage === currentStage
                );
            });

            // Если все этапы завершены - тренировка завершена
            if (allStagesCompleted) {
                // Все этапы завершены - отмечаем слова как выученные
                try {
                    await trainingApi.markWordsAsLearned(
                        trainingWords.map(w => w.id),
                    );

                    // Получаем обновленный список слов
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
                        title: 'Ошибка',
                        description: 'Не удалось отметить слова как выученные',
                        variant: 'destructive',
                    });
                    throw error;
                }
            }

            // Не все этапы завершены - ищем следующий незавершенный
            // Сначала проверяем следующий по порядку этап
            const currentIndex = stages.indexOf(currentStage);
            if (currentIndex < stages.length - 1) {
                const nextStage = stages[currentIndex + 1] as TrainingStage;
                const nextProgress = stagesProgress.find(
                    sp => sp.stage === nextStage,
                );

                // Если следующий этап еще не завершен - переходим к нему
                if (nextProgress?.status !== 'completed') {
                    return {
                        nextStage,
                        completed: false,
                    };
                }
            }

            // Следующий этап уже завершен или мы на последнем этапе
            // Ищем любой незавершенный этап
            return {
                completed: false,
            };
        },
        [toast],
    );

    return { handleStageComplete };
}
