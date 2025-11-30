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
                    // В режиме исправления ошибок
                    if (isCorrect) {
                        // Исправил ошибку - ищем следующую ошибку с учетом обновленных результатов
                        setExerciseResults(currentResults => {
                            const nextErrorIndex = findNextErrorWithResults(
                                currentIndex,
                                currentResults,
                            );
                            if (nextErrorIndex === -1) {
                                // Все ошибки исправлены - даем время увидеть все зеленые точки, затем завершаем этап
                                // Если это последний этап, показываем лоадер
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
                                    }, 1500); // Дополнительная задержка для визуального подтверждения
                                }
                            } else {
                                // Переходим к следующей ошибке
                                setCurrentIndex(nextErrorIndex);
                            }
                            return currentResults; // Возвращаем без изменений
                        });
                    } else {
                        // Снова ошибся - переходим к следующей ошибке (или к этой же, если она одна)
                        const nextErrorIndex = findNextError(currentIndex);
                        if (
                            nextErrorIndex === -1 ||
                            nextErrorIndex === currentIndex
                        ) {
                            // Это единственная ошибка или других нет - остаемся на ней, но перезагружаем карточку
                            triggerAnimation();
                            regenerateOptions();
                            resetSelection();
                        } else {
                            setCurrentIndex(nextErrorIndex);
                        }
                    }
                } else {
                    // Обычный режим
                    const result = handleNext();
                    if (result.type === 'next' || result.type === 'retry') {
                        setCurrentIndex(result.nextIndex);
                    } else if (result.type === 'complete') {
                        // Если это последний этап и последнее упражнение выполнено правильно
                        if (
                            isLastStage &&
                            currentIndex === wordsLength - 1 &&
                            isCorrect
                        ) {
                            // Проверяем, что все упражнения выполнены правильно
                            const allCorrect = exerciseResults.every(
                                result => result === true,
                            );
                            if (allCorrect) {
                                // Показываем лоадер и завершаем тренировку
                                setIsCompleting(true);
                                setTimeout(() => {
                                    onComplete();
                                }, 500);
                                return;
                            }
                        }
                        // Обычное завершение этапа
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
