import { useEffect } from 'react';

type UseStage3AutoAdvanceParams = {
    allMatched: boolean;
    pairsLength: number;
    currentBatch: number;
    totalBatches: number;
    exerciseResults: (boolean | null)[];
    isRetryMode: boolean;
    isLastStage?: boolean;
    onComplete: () => void;
    setCurrentBatch: (_batch: number) => void;
    setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
    setHasCompletedFirstRound: (_value: boolean) => void;
    setIsRetryMode: (_value: boolean) => void;
    setIsCompleting: (_value: boolean) => void;
    findNextErrorBatch: (_startBatch: number) => number;
};

export function useStage3AutoAdvance({
    allMatched,
    pairsLength,
    currentBatch,
    totalBatches,
    exerciseResults,
    isRetryMode,
    isLastStage = false,
    onComplete,
    setCurrentBatch,
    setRefreshKey,
    setHasCompletedFirstRound,
    setIsRetryMode,
    setIsCompleting,
    findNextErrorBatch,
}: UseStage3AutoAdvanceParams) {
    useEffect(() => {
        if (allMatched && pairsLength > 0) {
            const timer = setTimeout(() => {
                if (currentBatch < totalBatches - 1) {
                    setCurrentBatch(currentBatch + 1);
                } else {
                    // Completed all batches first time
                    setHasCompletedFirstRound(true);

                    // Check if there are errors in all batches
                    const hasAnyErrors = exerciseResults.some(
                        result => result === false,
                    );

                    if (hasAnyErrors) {
                        // There are errors - switch to correction mode
                        setIsRetryMode(true);
                        const firstErrorBatch = findNextErrorBatch(-1); // Find first batch with errors
                        if (firstErrorBatch !== -1) {
                            setCurrentBatch(firstErrorBatch);
                        }
                    } else {
                        // All correct - finish stage
                        // If this is the last stage and last batch completed correctly
                        if (isLastStage && currentBatch === totalBatches - 1) {
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
                        setCurrentBatch(0);
                        setIsRetryMode(false);
                        setHasCompletedFirstRound(false);
                    }
                }
            }, 1500); // 1.5 second delay for visual confirmation

            return () => clearTimeout(timer);
        } else if (isRetryMode && allMatched && pairsLength > 0) {
            // In retry mode, when completed current batch
            const timer = setTimeout(() => {
                const nextErrorBatch = findNextErrorBatch(currentBatch);

                if (nextErrorBatch === -1) {
                    // All errors fixed - finish stage
                    // If this is the last stage, show loader
                    if (isLastStage) {
                        setIsCompleting(true);
                        setTimeout(() => {
                            onComplete();
                        }, 500);
                    } else {
                        onComplete();
                        setCurrentBatch(0);
                        setIsRetryMode(false);
                        setHasCompletedFirstRound(false);
                    }
                } else if (nextErrorBatch === currentBatch) {
                    // This is the only batch with errors - reload it
                    setRefreshKey(prevKey => prevKey + 1);
                } else {
                    // Move to next batch with errors
                    setCurrentBatch(nextErrorBatch);
                }
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [
        allMatched,
        pairsLength,
        currentBatch,
        totalBatches,
        exerciseResults,
        isRetryMode,
        isLastStage,
        onComplete,
        setCurrentBatch,
        setRefreshKey,
        setHasCompletedFirstRound,
        setIsRetryMode,
        setIsCompleting,
        findNextErrorBatch,
    ]);
}
