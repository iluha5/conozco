import { useEffect } from 'react';
import type { UseRetryModeReturn } from '@/hooks/training';
import type { UseExerciseResultsReturn } from '@/hooks/training';

type UseAutoAdvanceParams = {
    selectedOption: string | null;
    isCorrect: boolean | null;
    currentIndex: number;
    isRetryMode: boolean;
    exerciseResults: (boolean | null)[];
    wordsLength: number;
    isLastStage?: boolean;
    onComplete: () => void;
    retryMode: UseRetryModeReturn;
    setExerciseResults: UseExerciseResultsReturn['setExerciseResults'];
    setCurrentIndex: (_index: number) => void;
    setIsCompleting: (_value: boolean) => void;
    resetSelection: () => void;
    regenerateOptions: () => void;
    triggerAnimation: () => void;
    handleNext: () =>
        | { type: 'next'; nextIndex: number }
        | { type: 'retry'; nextIndex: number }
        | { type: 'complete' };
    findNextError: (_startIndex: number) => number;
    findNextErrorWithResults: (
        _startIndex: number,
        _results: (boolean | null)[],
    ) => number;
};

export function useAutoAdvance({
    selectedOption,
    isCorrect,
    currentIndex,
    isRetryMode,
    exerciseResults,
    wordsLength,
    isLastStage = false,
    onComplete,
    retryMode,
    setExerciseResults,
    setCurrentIndex,
    setIsCompleting,
    resetSelection,
    regenerateOptions,
    triggerAnimation,
    handleNext,
    findNextError,
    findNextErrorWithResults,
}: UseAutoAdvanceParams) {
    useEffect(() => {
        if (selectedOption !== null) {
            const delay = isCorrect ? 800 : 2000;
            const timer = setTimeout(() => {
                if (isRetryMode) {
                    // In error correction mode
                    if (isCorrect) {
                        // Fixed error - find next error considering updated results
                        setExerciseResults(currentResults => {
                            const nextErrorIndex = findNextErrorWithResults(
                                currentIndex,
                                currentResults,
                            );
                            if (nextErrorIndex === -1) {
                                // All errors fixed - give time to see all green dots, then finish stage
                                // If this is the last stage, show loader
                                if (isLastStage) {
                                    setIsCompleting(true);
                                    setTimeout(() => {
                                        onComplete();
                                    }, 500);
                                } else {
                                    setTimeout(() => {
                                        onComplete();
                                        setCurrentIndex(0);
                                        retryMode.setIsRetryMode(false);
                                        retryMode.setHasCompletedFirstRound(
                                            false,
                                        );
                                    }, 1500); // Additional delay for visual confirmation
                                }
                            } else {
                                // Move to next error
                                setCurrentIndex(nextErrorIndex);
                            }
                            return currentResults; // Return unchanged
                        });
                    } else {
                        // Made mistake again - move to next error (or stay on this one if it's the only one)
                        const nextErrorIndex = findNextError(currentIndex);
                        if (
                            nextErrorIndex === -1 ||
                            nextErrorIndex === currentIndex
                        ) {
                            // This is the only error or no others - stay on it, but reload card
                            triggerAnimation();
                            regenerateOptions();
                            resetSelection();
                        } else {
                            setCurrentIndex(nextErrorIndex);
                        }
                    }
                } else {
                    // Normal mode
                    const result = handleNext();
                    if (result.type === 'next' || result.type === 'retry') {
                        setCurrentIndex(result.nextIndex);
                    } else if (result.type === 'complete') {
                        // If this is the last stage and last exercise completed correctly
                        if (
                            isLastStage &&
                            currentIndex === wordsLength - 1 &&
                            isCorrect
                        ) {
                            // Check that all exercises are completed correctly
                            const allCorrect = exerciseResults.every(
                                result => result === true,
                            );
                            if (allCorrect) {
                                // Show loader and finish training
                                setIsCompleting(true);
                                setTimeout(() => {
                                    onComplete();
                                }, 500);
                                return;
                            }
                        }
                        // Normal stage completion
                        onComplete();
                        setCurrentIndex(0);
                    }
                }
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [
        selectedOption,
        isCorrect,
        currentIndex,
        isRetryMode,
        exerciseResults,
        wordsLength,
        isLastStage,
        onComplete,
        retryMode,
        setExerciseResults,
        setCurrentIndex,
        setIsCompleting,
        resetSelection,
        regenerateOptions,
        triggerAnimation,
        handleNext,
        findNextError,
        findNextErrorWithResults,
    ]);
}
