import { useEffect } from 'react';

type UseStage6AutoAdvanceParams = {
    isComplete: boolean;
    isCorrect: boolean | null;
    currentIndex: number;
    isRetryMode: boolean;
    exerciseResults: (boolean | null)[];
    baseWordsLength: number;
    isLastStage?: boolean;
    onComplete: () => void;
    setCurrentIndex: (_index: number) => void;
    setExerciseResults: React.Dispatch<
        React.SetStateAction<(boolean | null)[]>
    >;
    setIsRetryMode: (_value: boolean) => void;
    setHasCompletedFirstRound: (_value: boolean) => void;
    setIsCompleting: (_value: boolean) => void;
    findNextErrorWithResults: (
        _startIndex: number,
        _results: (boolean | null)[],
    ) => number;
    findNextError: (_startIndex: number) => number;
    handleNext: () =>
        | { type: 'next'; nextIndex: number }
        | { type: 'retry'; nextIndex: number }
        | { type: 'complete' };
    triggerAnimation: () => void;
    initializeLetters: () => void;
    resetWordBuilding: () => void;
    setBackgroundFlash: React.Dispatch<
        React.SetStateAction<'green' | 'red' | null>
    >;
    setShowResultPopup: React.Dispatch<React.SetStateAction<boolean>>;
    speak: (_text: string) => void;
    currentWordText: string;
};

export function useStage6AutoAdvance({
    isComplete,
    isCorrect,
    currentIndex,
    isRetryMode,
    exerciseResults,
    baseWordsLength,
    isLastStage = false,
    onComplete,
    setCurrentIndex,
    setExerciseResults,
    setIsRetryMode,
    setHasCompletedFirstRound,
    setIsCompleting,
    findNextErrorWithResults,
    findNextError,
    handleNext,
    triggerAnimation,
    initializeLetters,
    resetWordBuilding,
    setBackgroundFlash,
    setShowResultPopup,
    speak,
    currentWordText,
}: UseStage6AutoAdvanceParams) {
    useEffect(() => {
        if (isComplete && isCorrect !== null) {
            const delay = isCorrect ? 1000 : 2000;
            const timer = setTimeout(() => {
                if (isRetryMode) {
                    // В режиме исправления ошибок
                    if (isCorrect) {
                        // Исправил ошибку - ищем следующую ошибку с учетом обновленных результатов
                        setExerciseResults(currentResults => {
                            // Сначала обновляем результат текущего упражнения на правильный
                            const updatedResults = [...currentResults];
                            updatedResults[currentIndex] = true;

                            const nextErrorIndex = findNextErrorWithResults(
                                currentIndex,
                                updatedResults,
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
                            return updatedResults;
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
                            initializeLetters();
                            resetWordBuilding();
                            setBackgroundFlash(null);
                            setShowResultPopup(false);
                            // Автоматически проигрываем слово снова
                            setTimeout(() => speak(currentWordText), 500);
                        } else {
                            setCurrentIndex(nextErrorIndex);
                        }
                    }
                } else {
                    // Обычный режим - всегда переходим к следующему (или в retry mode)
                    const result = handleNext();
                    if (result.type === 'next') {
                        setCurrentIndex(result.nextIndex);
                    } else if (result.type === 'retry') {
                        setIsRetryMode(true);
                        setHasCompletedFirstRound(true);
                        setCurrentIndex(result.nextIndex);
                    } else if (result.type === 'complete') {
                        // Если это последний этап и последнее упражнение выполнено правильно
                        if (
                            isLastStage &&
                            currentIndex === baseWordsLength - 1 &&
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
        baseWordsLength,
        isLastStage,
        onComplete,
        setCurrentIndex,
        setExerciseResults,
        setIsRetryMode,
        setHasCompletedFirstRound,
        setIsCompleting,
        findNextErrorWithResults,
        findNextError,
        handleNext,
        triggerAnimation,
        initializeLetters,
        resetWordBuilding,
        setBackgroundFlash,
        setShowResultPopup,
        speak,
        currentWordText,
    ]);
}
