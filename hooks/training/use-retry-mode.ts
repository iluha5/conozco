import { useState, useCallback } from 'react';

export interface UseRetryModeOptions {
    totalExercises: number;
}

export interface UseRetryModeReturn {
    isRetryMode: boolean;
    hasCompletedFirstRound: boolean;
    findNextError: (
        _startIndex: number,
        _results: (boolean | null)[],
    ) => number;
    findNextErrorWithResults: (
        _startIndex: number,
        _results: (boolean | null)[],
    ) => number;
    hasErrors: (_results: (boolean | null)[]) => boolean;
    getErrorIndices: (_results: (boolean | null)[]) => number[];
    setIsRetryMode: (_value: boolean) => void;
    setHasCompletedFirstRound: (_value: boolean) => void;
    reset: () => void;
}

export function useRetryMode(): UseRetryModeReturn {
    const [isRetryMode, setIsRetryMode] = useState(false);
    const [hasCompletedFirstRound, setHasCompletedFirstRound] = useState(false);

    const findNextErrorWithResults = useCallback(
        (startIndex: number, results: (boolean | null)[]): number => {
            for (let i = startIndex + 1; i < results.length; i++) {
                if (results[i] === false) return i;
            }
            for (let i = 0; i <= startIndex; i++) {
                if (results[i] === false) return i;
            }
            return -1;
        },
        [],
    );

    const findNextError = useCallback(
        (startIndex: number, results: (boolean | null)[]): number => {
            return findNextErrorWithResults(startIndex, results);
        },
        [findNextErrorWithResults],
    );

    const hasErrors = useCallback((results: (boolean | null)[]): boolean => {
        return results.some(result => result === false);
    }, []);

    const getErrorIndices = useCallback(
        (results: (boolean | null)[]): number[] => {
            return results
                .map((result, idx) => (result === false ? idx : -1))
                .filter(idx => idx !== -1);
        },
        [],
    );

    const reset = useCallback(() => {
        setIsRetryMode(false);
        setHasCompletedFirstRound(false);
    }, []);

    return {
        isRetryMode,
        hasCompletedFirstRound,
        findNextError,
        findNextErrorWithResults,
        hasErrors,
        getErrorIndices,
        setIsRetryMode,
        setHasCompletedFirstRound,
        reset,
    };
}
