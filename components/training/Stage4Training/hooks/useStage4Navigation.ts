import { useCallback } from 'react';

type UseStage4NavigationParams = {
    currentIndex: number;
    wordsLength: number;
    exerciseResults: (boolean | null)[];
    onComplete: () => void;
};

export function useStage4Navigation({
    currentIndex,
    wordsLength,
    exerciseResults,
}: UseStage4NavigationParams) {
    const findNextErrorWithResults = useCallback(
        (startIndex: number, results: (boolean | null)[]) => {
            for (
                let errorIndex = startIndex + 1;
                errorIndex < results.length;
                errorIndex++
            ) {
                if (results[errorIndex] === false) {
                    return errorIndex;
                }
            }
            // Wrap to start when no error after startIndex
            for (let errorIndex = 0; errorIndex <= startIndex; errorIndex++) {
                if (results[errorIndex] === false) {
                    return errorIndex;
                }
            }
            return -1;
        },
        [],
    );

    const findNextError = useCallback(
        (startIndex: number) => {
            return findNextErrorWithResults(startIndex, exerciseResults);
        },
        [findNextErrorWithResults, exerciseResults],
    );

    const getErrorIndices = useCallback(() => {
        return exerciseResults
            .map((result, resultIndex) => (result === false ? resultIndex : -1))
            .filter(resultIndex => resultIndex !== -1);
    }, [exerciseResults]);

    const handleNext = useCallback(() => {
        if (currentIndex < wordsLength - 1) {
            return { type: 'next' as const, nextIndex: currentIndex + 1 };
        } else {
            const errorIndices = getErrorIndices();

            if (errorIndices.length > 0) {
                return {
                    type: 'retry' as const,
                    nextIndex: errorIndices[0],
                };
            } else {
                return { type: 'complete' as const };
            }
        }
    }, [currentIndex, wordsLength, getErrorIndices]);

    return {
        findNextError,
        findNextErrorWithResults,
        handleNext,
    };
}
