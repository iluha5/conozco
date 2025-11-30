import { useCallback } from 'react';
import type { UseRecordResultReturn } from '@/hooks/training';
import type { UseExerciseResultsReturn } from '@/hooks/training';

type UseStage1NavigationParams = {
    currentIndex: number;
    wordsLength: number;
    currentWordId: string;
    exerciseResults: (boolean | null)[];
    isLastStage?: boolean;
    updateResult: UseExerciseResultsReturn['updateResult'];
    recordResult: UseRecordResultReturn['recordResult'];
    onComplete: () => void;
    setIsCompleting: (_value: boolean) => void;
};

export function useStage1Navigation({
    currentIndex,
    wordsLength,
    currentWordId,
    exerciseResults,
    isLastStage = false,
    updateResult,
    recordResult,
    onComplete,
    setIsCompleting,
}: UseStage1NavigationParams) {
    const handleNext = useCallback(async () => {
        // Записываем результат (всегда успешный на 1 этапе - просто просмотр)
        await recordResult(1, currentWordId, true);

        // Обновляем результаты упражнения
        updateResult(currentIndex, true);

        if (currentIndex < wordsLength - 1) {
            return { type: 'next' as const, nextIndex: currentIndex + 1 };
        } else {
            // Если это последний этап и последнее упражнение
            if (isLastStage && currentIndex === wordsLength - 1) {
                // Проверяем, что все упражнения выполнены
                const allCompleted = exerciseResults.every(
                    result => result === true,
                );
                if (allCompleted) {
                    // Показываем лоадер и завершаем тренировку
                    setIsCompleting(true);
                    setTimeout(() => {
                        onComplete();
                    }, 500);
                    return { type: 'complete' as const };
                }
            }
            // Обычное завершение этапа
            onComplete();
            return { type: 'complete' as const };
        }
    }, [
        currentIndex,
        wordsLength,
        currentWordId,
        exerciseResults,
        isLastStage,
        updateResult,
        recordResult,
        onComplete,
        setIsCompleting,
    ]);

    return {
        handleNext,
    };
}
