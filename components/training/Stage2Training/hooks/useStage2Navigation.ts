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
            // Completed all words first time
            setHasCompletedFirstRound(true);

            // Check if there are errors
            const errorIndices = getErrorIndices(exerciseResults);

            if (errorIndices.length > 0) {
                // There are errors - switch to correction mode
                setIsRetryMode(true);
                return { type: 'retry' as const, nextIndex: errorIndices[0] };
            } else {
                // All correct - finish stage
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
