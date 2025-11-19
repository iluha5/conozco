import { useCallback } from 'react';
import { useToast } from '@/hooks/shared';
import { trainingApi } from '@/lib/api/training.api';
import { Word, StageCompletionResult } from '@/types/training.types';

/**
 * Хук с бизнес-логикой тренировки
 */
export function useTrainingLogic() {
    const { toast } = useToast();

    const handleStageComplete = useCallback(
        async (
            currentStage: number,
            enabledStages: Set<number>,
            trainingWords: Word[],
        ): Promise<StageCompletionResult> => {
            const stages = Array.from(enabledStages).sort();
            const currentIndex = stages.indexOf(currentStage);

            // Если не последний этап - переходим к следующему
            if (currentIndex < stages.length - 1) {
                return {
                    nextStage: stages[currentIndex + 1] as
                        | 1
                        | 2
                        | 3
                        | 4
                        | 5
                        | 6,
                    completed: false,
                };
            }

            // Последний этап - отмечаем слова как выученные
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
        },
        [toast],
    );

    return { handleStageComplete };
}
