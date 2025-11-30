import { useCallback } from 'react';
import type { UseRecordResultReturn } from '@/hooks/training';
import type { UseExerciseResultsReturn } from '@/hooks/training';

type UseStage1NavigationParams = {
    currentIndex: number;
    wordsLength: number;
    currentWordId: string;
    updateResult: UseExerciseResultsReturn['updateResult'];
    recordResult: UseRecordResultReturn['recordResult'];
    onComplete: () => void;
};

export function useStage1Navigation({
    currentIndex,
    wordsLength,
    currentWordId,
    updateResult,
    recordResult,
    onComplete,
}: UseStage1NavigationParams) {
    const handleNext = useCallback(async () => {
        // Записываем результат (всегда успешный на 1 этапе - просто просмотр)
        await recordResult(1, currentWordId, true);

        // Обновляем результаты упражнения
        updateResult(currentIndex, true);

        if (currentIndex < wordsLength - 1) {
            return { type: 'next' as const, nextIndex: currentIndex + 1 };
        } else {
            onComplete();
            return { type: 'complete' as const };
        }
    }, [
        currentIndex,
        wordsLength,
        currentWordId,
        updateResult,
        recordResult,
        onComplete,
    ]);

    return {
        handleNext,
    };
}
