import { useEffect } from 'react';

type UseStage4AutoAdvanceParams = {
    isComplete: boolean;
    isCorrect: boolean | null;
    currentIndex: number;
    isRetryMode: boolean;
    exerciseResults: (boolean | null)[];
    onComplete: () => void;
    setCurrentIndex: (_index: number) => void;
    setExerciseResults: React.Dispatch<
        React.SetStateAction<(boolean | null)[]>
    >;
    setHasCompletedFirstRound: (_value: boolean) => void;
    setIsRetryMode: (_value: boolean) => void;
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
    onComplete,
    setCurrentIndex,
    setExerciseResults,
    setHasCompletedFirstRound,
    setIsRetryMode,
    findNextErrorWithResults,
    handleNext,
}: UseStage4AutoAdvanceParams) {
    useEffect(() => {
        // Автоматический переход только при правильном ответе
        if (isComplete && isCorrect) {
            const delay = 1000;
            const timer = setTimeout(() => {
                if (isRetryMode) {
                    // В режиме исправления ошибок
                    // Исправил ошибку - ищем следующую ошибку с учетом обновленных результатов
                    setExerciseResults(currentResults => {
                        const nextErrorIndex = findNextErrorWithResults(
                            currentIndex,
                            currentResults,
                        );
                        if (nextErrorIndex === -1) {
                            // Все ошибки исправлены - даем время увидеть все зеленые точки, затем завершаем этап
                            setTimeout(() => {
                                onComplete();
                                setCurrentIndex(0);
                                setIsRetryMode(false);
                                setHasCompletedFirstRound(false);
                            }, 1500); // Дополнительная задержка для визуального подтверждения
                        } else {
                            // Переходим к следующей ошибке
                            setCurrentIndex(nextErrorIndex);
                        }
                        return currentResults; // Возвращаем без изменений
                    });
                } else {
                    // Обычный режим - переходим к следующему
                    const result = handleNext();
                    if (result.type === 'next') {
                        setCurrentIndex(result.nextIndex);
                    } else if (result.type === 'retry') {
                        setIsRetryMode(true);
                        setHasCompletedFirstRound(true);
                        setCurrentIndex(result.nextIndex);
                    } else if (result.type === 'complete') {
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
        onComplete,
        setCurrentIndex,
        setExerciseResults,
        setHasCompletedFirstRound,
        setIsRetryMode,
        findNextErrorWithResults,
        handleNext,
    ]);
}
