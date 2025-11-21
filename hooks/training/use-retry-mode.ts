/**
 * Хук для управления режимом повторения ошибок (retry mode)
 * Используется в stage 2-6 для обработки неправильных ответов
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseRetryModeOptions {
    /**
     * Общее количество упражнений
     */
    totalExercises: number;
}

export interface UseRetryModeReturn {
    /**
     * Находимся ли в режиме повторения ошибок
     */
    isRetryMode: boolean;

    /**
     * Завершен ли первый раунд
     */
    hasCompletedFirstRound: boolean;

    /**
     * Найти следующую ошибку (использует текущее состояние exerciseResults)
     */
    findNextError: (startIndex: number, results: (boolean | null)[]) => number;

    /**
     * Найти следующую ошибку с передачей результатов (для работы в setExerciseResults callback)
     */
    findNextErrorWithResults: (
        startIndex: number,
        results: (boolean | null)[],
    ) => number;

    /**
     * Проверить, есть ли ошибки в результатах
     */
    hasErrors: (results: (boolean | null)[]) => boolean;

    /**
     * Получить индексы всех ошибок
     */
    getErrorIndices: (results: (boolean | null)[]) => number[];

    /**
     * Установить режим повторения
     */
    setIsRetryMode: (value: boolean) => void;

    /**
     * Установить флаг завершения первого раунда
     */
    setHasCompletedFirstRound: (value: boolean) => void;

    /**
     * Сбросить состояние retry mode
     */
    reset: () => void;
}

export function useRetryMode(options: UseRetryModeOptions): UseRetryModeReturn {
    const [isRetryMode, setIsRetryMode] = useState(false);
    const [hasCompletedFirstRound, setHasCompletedFirstRound] = useState(false);

    /**
     * Найти следующую ошибку после указанного индекса
     */
    const findNextErrorWithResults = useCallback(
        (startIndex: number, results: (boolean | null)[]): number => {
            // Ищем следующую ошибку после текущего индекса
            for (let i = startIndex + 1; i < results.length; i++) {
                if (results[i] === false) {
                    return i;
                }
            }
            // Если не нашли, ищем с начала до текущего индекса
            for (let i = 0; i <= startIndex; i++) {
                if (results[i] === false) {
                    return i;
                }
            }
            return -1; // Ошибок больше нет
        },
        [],
    );

    /**
     * Найти следующую ошибку (обертка для использования с текущим состоянием)
     */
    const findNextError = useCallback(
        (startIndex: number, results: (boolean | null)[]): number => {
            return findNextErrorWithResults(startIndex, results);
        },
        [findNextErrorWithResults],
    );

    /**
     * Проверить, есть ли ошибки
     */
    const hasErrors = useCallback((results: (boolean | null)[]): boolean => {
        return results.some(r => r === false);
    }, []);

    /**
     * Получить индексы всех ошибок
     */
    const getErrorIndices = useCallback(
        (results: (boolean | null)[]): number[] => {
            return results
                .map((result, idx) => (result === false ? idx : -1))
                .filter(idx => idx !== -1);
        },
        [],
    );

    /**
     * Сбросить состояние retry mode
     */
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
