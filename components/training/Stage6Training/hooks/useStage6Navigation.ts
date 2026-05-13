import { useCallback } from 'react';

type UseStage6NavigationParams = {
    currentIndex: number;
    baseWordsLength: number;
    exerciseResults: (boolean | null)[];
    getErrorIndices: (_results: (boolean | null)[]) => number[];
    setIsRetryMode: (_value: boolean) => void;
    setHasCompletedFirstRound: (_value: boolean) => void;
};

export function useStage6Navigation({
    currentIndex,
    baseWordsLength,
    exerciseResults,
    getErrorIndices,
    setIsRetryMode,
    setHasCompletedFirstRound,
}: UseStage6NavigationParams) {
    const handleNext = useCallback(() => {
        if (currentIndex < baseWordsLength - 1) {
            return {
                type: 'next' as const,
                nextIndex: currentIndex + 1,
            };
        } else {
            setHasCompletedFirstRound(true);

            const errorIndices = getErrorIndices(exerciseResults);

            if (errorIndices.length > 0) {
                setIsRetryMode(true);
                return {
                    type: 'retry' as const,
                    nextIndex: errorIndices[0],
                };
            } else {
                return { type: 'complete' as const };
            }
        }
    }, [
        currentIndex,
        baseWordsLength,
        exerciseResults,
        getErrorIndices,
        setIsRetryMode,
        setHasCompletedFirstRound,
    ]);

    return {
        handleNext,
    };
}
