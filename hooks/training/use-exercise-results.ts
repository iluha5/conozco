import { useState, useEffect, useCallback } from 'react';

export interface UseExerciseResultsOptions {
    totalExercises: number;
}

export interface UseExerciseResultsReturn {
    exerciseResults: (boolean | null)[];
    // eslint-disable-next-line no-unused-vars
    updateResult: (index: number, result: boolean) => void;
    // eslint-disable-next-line no-unused-vars
    updateResults: (updates: Array<{ index: number; result: boolean }>) => void;
    reset: () => void;
    completedCount: number;
    correctCount: number;
    incorrectCount: number;
    setExerciseResults: React.Dispatch<
        React.SetStateAction<(boolean | null)[]>
    >;
}

export function useExerciseResults(
    options: UseExerciseResultsOptions,
): UseExerciseResultsReturn {
    const { totalExercises } = options;

    const [exerciseResults, setExerciseResults] = useState<(boolean | null)[]>(
        () => new Array(totalExercises).fill(null),
    );

    useEffect(() => {
        setExerciseResults(new Array(totalExercises).fill(null));
    }, [totalExercises]);

    const updateResult = useCallback((index: number, result: boolean) => {
        setExerciseResults(prev => {
            const next = [...prev];
            next[index] = result;
            return next;
        });
    }, []);

    const updateResults = useCallback(
        (updates: Array<{ index: number; result: boolean }>) => {
            setExerciseResults(prev => {
                const next = [...prev];
                updates.forEach(({ index, result }) => {
                    next[index] = result;
                });
                return next;
            });
        },
        [],
    );

    const reset = useCallback(() => {
        setExerciseResults(new Array(totalExercises).fill(null));
    }, [totalExercises]);

    const completedCount = exerciseResults.filter(r => r !== null).length;
    const correctCount = exerciseResults.filter(r => r === true).length;
    const incorrectCount = exerciseResults.filter(r => r === false).length;

    return {
        exerciseResults,
        updateResult,
        updateResults,
        reset,
        completedCount,
        correctCount,
        incorrectCount,
        setExerciseResults,
    };
}
