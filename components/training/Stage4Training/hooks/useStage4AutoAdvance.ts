import { useEffect } from 'react';

type UseStage4AutoAdvanceParams = {
    isComplete: boolean;
    isCorrect: boolean | null;
    currentIndex: number;
    isRetryMode: boolean;
    exerciseResults: (boolean | null)[];
    baseWordsLength: number;
    isLastStage?: boolean;
    onComplete: () => void;
    setCurrentIndex: (_index: number) => void;
    setExerciseResults: React.Dispatch<
        React.SetStateAction<(boolean | null)[]>
    >;
    setHasCompletedFirstRound: (_value: boolean) => void;
    setIsRetryMode: (_value: boolean) => void;
    setIsCompleting: (_value: boolean) => void;
    findNextErrorWithResults: (
        _startIndex: number,
        _results: (boolean | null)[],
    ) => number;
    handleNext: () =>
        | { type: 'next'; nextIndex: number }
        | { type: 'retry'; nextIndex: number }
        | { type: 'complete' };
};

export function useStage4AutoAdvance({
    isComplete,
    isCorrect,
    currentIndex,
    isRetryMode,
    exerciseResults,
    baseWordsLength,
    isLastStage = false,
    onComplete,
    setCurrentIndex,
    setExerciseResults,
    setHasCompletedFirstRound,
    setIsRetryMode,
    setIsCompleting,
    findNextErrorWithResults,
    handleNext,
}: UseStage4AutoAdvanceParams) {
    useEffect(() => {
        // Auto-advance only on a correct answer
        if (isComplete && isCorrect) {
            const delay = 1000;
            const timer = setTimeout(() => {
                if (isRetryMode) {
                    setExerciseResults(currentResults => {
                        const nextErrorIndex = findNextErrorWithResults(
                            currentIndex,
                            currentResults,
                        );
                        if (nextErrorIndex === -1) {
                            if (isLastStage) {
                                setIsCompleting(true);
                                setTimeout(() => {
                                    onComplete();
                                }, 500);
                            } else {
                                // Extra delay so user sees all green dots
                                setTimeout(() => {
                                    onComplete();
                                    setCurrentIndex(0);
                                    setIsRetryMode(false);
                                    setHasCompletedFirstRound(false);
                                }, 1500);
                            }
                        } else {
                            setCurrentIndex(nextErrorIndex);
                        }
                        return currentResults;
                    });
                } else {
                    const result = handleNext();
                    if (result.type === 'next') {
                        setCurrentIndex(result.nextIndex);
                    } else if (result.type === 'retry') {
                        setIsRetryMode(true);
                        setHasCompletedFirstRound(true);
                        setCurrentIndex(result.nextIndex);
                    } else if (result.type === 'complete') {
                        if (
                            isLastStage &&
                            currentIndex === baseWordsLength - 1 &&
                            isCorrect
                        ) {
                            const allCorrect = exerciseResults.every(
                                result => result === true,
                            );
                            if (allCorrect) {
                                setIsCompleting(true);
                                setTimeout(() => {
                                    onComplete();
                                }, 500);
                                return;
                            }
                        }
                        onComplete();
                        setCurrentIndex(0);
                        setIsRetryMode(false);
                        setHasCompletedFirstRound(false);
                    }
                }
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [
        isComplete,
        isCorrect,
        currentIndex,
        isRetryMode,
        exerciseResults,
        baseWordsLength,
        isLastStage,
        onComplete,
        setCurrentIndex,
        setExerciseResults,
        setHasCompletedFirstRound,
        setIsRetryMode,
        setIsCompleting,
        findNextErrorWithResults,
        handleNext,
    ]);
}
