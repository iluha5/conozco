/**
 * Хук для управления результатами упражнений
 * Автоматически инициализирует массив результатов при изменении количества упражнений
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseExerciseResultsOptions {
    /**
     * Общее количество упражнений
     */
    totalExercises: number;
}

export interface UseExerciseResultsReturn {
    /**
     * Массив результатов упражнений (true - правильно, false - неправильно, null - не выполнено)
     */
    exerciseResults: (boolean | null)[];

    /**
     * Обновить результат упражнения
     */
    // eslint-disable-next-line no-unused-vars
    updateResult: (index: number, result: boolean) => void;

    /**
     * Обновить результаты батчем (для stage3 с группами)
     */
    // eslint-disable-next-line no-unused-vars
    updateResults: (updates: Array<{ index: number; result: boolean }>) => void;

    /**
     * Сбросить все результаты
     */
    reset: () => void;

    /**
     * Получить количество завершенных упражнений
     */
    completedCount: number;

    /**
     * Получить количество правильных ответов
     */
    correctCount: number;

    /**
     * Получить количество неправильных ответов
     */
    incorrectCount: number;

    /**
     * Установить состояние напрямую (для сложных обновлений)
     */
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

    // Initialize results array when exercise count changes
    useEffect(() => {
        setExerciseResults(new Array(totalExercises).fill(null));
    }, [totalExercises]);

    /**
     * Обновить результат одного упражнения
     */
    const updateResult = useCallback((index: number, result: boolean) => {
        setExerciseResults(prev => {
            const newResults = [...prev];
            newResults[index] = result;
            return newResults;
        });
    }, []);

    /**
     * Обновить несколько результатов одновременно
     */
    const updateResults = useCallback(
        (updates: Array<{ index: number; result: boolean }>) => {
            setExerciseResults(prev => {
                const newResults = [...prev];
                updates.forEach(({ index, result }) => {
                    newResults[index] = result;
                });
                return newResults;
            });
        },
        [],
    );

    /**
     * Сбросить все результаты
     */
    const reset = useCallback(() => {
        setExerciseResults(new Array(totalExercises).fill(null));
    }, [totalExercises]);

    /**
     * Подсчет завершенных упражнений
     */
    const completedCount = exerciseResults.filter(r => r !== null).length;

    /**
     * Подсчет правильных ответов
     */
    const correctCount = exerciseResults.filter(r => r === true).length;

    /**
     * Подсчет неправильных ответов
     */
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
