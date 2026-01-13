import { useCallback } from 'react';

type UseStage3NavigationParams = {
    totalBatches: number;
    wordsPerBatch: number;
    wordsLength: number;
    exerciseResults: (boolean | null)[];
};

export function useStage3Navigation({
    totalBatches,
    wordsPerBatch,
    wordsLength,
    exerciseResults,
}: UseStage3NavigationParams) {
    const findNextErrorBatch = useCallback(
        (startBatch: number) => {
            // Find next batch with errors after current
            for (
                let batchIndex = startBatch + 1;
                batchIndex < totalBatches;
                batchIndex++
            ) {
                const batchStart = batchIndex * wordsPerBatch;
                const batchEnd = Math.min(
                    (batchIndex + 1) * wordsPerBatch,
                    wordsLength,
                );
                const batchResults = exerciseResults.slice(
                    batchStart,
                    batchEnd,
                );
                if (batchResults.some(result => result === false)) {
                    return batchIndex;
                }
            }
            // If not found, search from beginning to current batch
            for (let batchIndex = 0; batchIndex <= startBatch; batchIndex++) {
                const batchStart = batchIndex * wordsPerBatch;
                const batchEnd = Math.min(
                    (batchIndex + 1) * wordsPerBatch,
                    wordsLength,
                );
                const batchResults = exerciseResults.slice(
                    batchStart,
                    batchEnd,
                );
                if (batchResults.some(result => result === false)) {
                    return batchIndex;
                }
            }
            return -1; // No more errors
        },
        [totalBatches, wordsPerBatch, wordsLength, exerciseResults],
    );

    return {
        findNextErrorBatch,
    };
}
