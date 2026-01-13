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
        // Record result (always successful on stage 1 - just viewing)
        await recordResult(1, currentWordId, true);

        // Update exercise results
        updateResult(currentIndex, true);

        if (currentIndex < wordsLength - 1) {
            return { type: 'next' as const, nextIndex: currentIndex + 1 };
        } else {
            // If this is the last stage and last exercise
            if (isLastStage && currentIndex === wordsLength - 1) {
                // Check that all exercises are completed
                const allCompleted = exerciseResults.every(
                    result => result === true,
                );
                if (allCompleted) {
                    // Show loader and finish training
                    setIsCompleting(true);
                    setTimeout(() => {
                        onComplete();
                    }, 500);
                    return { type: 'complete' as const };
                }
            }
            // Normal stage completion
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
