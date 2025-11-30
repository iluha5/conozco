import { useCallback } from 'react';
import type { UseRetryModeReturn } from '@/hooks/training';

type UseStage2NavigationParams = {
    currentIndex: number;
    wordsLength: number;
    exerciseResults: (boolean | null)[];
    onComplete: () => void;
    retryMode: UseRetryModeReturn;
};

export function useStage2Navigation({
    currentIndex,
    wordsLength,
    exerciseResults,
    onComplete: _onComplete,
    retryMode,
}: UseStage2NavigationParams) {
    const {
        isRetryMode,
        findNextErrorWithResults,
        getErrorIndices,
        setIsRetryMode,
        setHasCompletedFirstRound,
    } = retryMode;

    const findNextError = useCallback(
        (startIndex: number) => {
            return findNextErrorWithResults(startIndex, exerciseResults);
        },
        [findNextErrorWithResults, exerciseResults],
    );

    const handleNext = useCallback(() => {
        if (currentIndex < wordsLength - 1) {
            return { type: 'next' as const, nextIndex: currentIndex + 1 };
        } else {
            // Завершили все слова первый раз
            setHasCompletedFirstRound(true);

            // Проверяем, есть ли ошибки
            const errorIndices = getErrorIndices(exerciseResults);

            if (errorIndices.length > 0) {
                // Есть ошибки - переходим в режим исправления
                setIsRetryMode(true);
                return { type: 'retry' as const, nextIndex: errorIndices[0] };
            } else {
                // Все правильно - завершаем этап
                setIsRetryMode(false);
                setHasCompletedFirstRound(false);
                return { type: 'complete' as const };
            }
        }
    }, [
        currentIndex,
        wordsLength,
        exerciseResults,
        getErrorIndices,
        setIsRetryMode,
        setHasCompletedFirstRound,
    ]);

    return {
        isRetryMode,
        findNextError,
        handleNext,
        findNextErrorWithResults,
    };
}
