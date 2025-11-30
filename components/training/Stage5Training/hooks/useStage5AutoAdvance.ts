import { useEffect } from 'react';
import { getWordAndPhraseIndex } from '../helpers/getWordAndPhraseIndex';
import { findNextErrorWithResults } from '../helpers/findNextError';
import type { Phrase } from '../typing';

type UseStage5AutoAdvanceParams = {
    isComplete: boolean;
    isCorrect: boolean | null;
    currentIndex: number;
    currentPhraseIndex: number;
    isRetryMode: boolean;
    exerciseResults: (boolean | null)[];
    wordPhrases: Phrase[][];
    wordsWithPhrasesLength: number;
    isLastStage?: boolean;
    onComplete: () => void;
    setCurrentIndex: (_index: number) => void;
    setCurrentPhraseIndex: (_phraseIndex: number) => void;
    setExerciseResults: React.Dispatch<
        React.SetStateAction<(boolean | null)[]>
    >;
    setHasCompletedFirstRound: (_value: boolean) => void;
    setIsRetryMode: (_value: boolean) => void;
    setIsCompleting: (_value: boolean) => void;
};

export function useStage5AutoAdvance({
    isComplete,
    isCorrect,
    currentIndex,
    currentPhraseIndex,
    isRetryMode,
    exerciseResults,
    wordPhrases,
    wordsWithPhrasesLength,
    isLastStage = false,
    onComplete,
    setCurrentIndex,
    setCurrentPhraseIndex,
    setExerciseResults,
    setHasCompletedFirstRound,
    setIsRetryMode,
    setIsCompleting,
}: UseStage5AutoAdvanceParams) {
    useEffect(() => {
        // Автоматический переход только при правильном ответе
        if (isComplete && isCorrect) {
            const delay = 1000;
            const timer = setTimeout(() => {
                // Используем функциональное обновление для получения актуальных значений
                setExerciseResults(currentResults => {
                    // Вычисляем текущий индекс упражнения с актуальными значениями
                    const currentExerciseIndex =
                        wordPhrases
                            .slice(0, currentIndex)
                            .reduce(
                                (total, phrases) => total + phrases.length,
                                0,
                            ) + currentPhraseIndex;

                    if (isRetryMode) {
                        // В режиме исправления ошибок
                        // Сначала обновляем результат текущего упражнения на правильный
                        const updatedResults = [...currentResults];
                        updatedResults[currentExerciseIndex] = true;

                        // Ищем следующую ошибку с учетом обновленных результатов
                        const nextErrorIndex = findNextErrorWithResults(
                            currentExerciseIndex,
                            updatedResults,
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
                                    setCurrentPhraseIndex(0);
                                    setIsRetryMode(false);
                                    setHasCompletedFirstRound(false);
                                }, 1500); // Дополнительная задержка для визуального подтверждения
                            }
                        } else {
                            // Переходим к следующей ошибке
                            const nextErrorPosition = getWordAndPhraseIndex(
                                nextErrorIndex,
                                wordPhrases,
                            );
                            if (nextErrorPosition) {
                                setCurrentIndex(nextErrorPosition.wordIndex);
                                setCurrentPhraseIndex(
                                    nextErrorPosition.phraseIndex,
                                );
                            }
                        }

                        // Возвращаем обновленные результаты
                        return updatedResults;
                    } else {
                        // Обычный режим - проверяем актуальное состояние перед переходом
                        // Это критично для последнего слова/фразы
                        const currentWordPhrases =
                            wordPhrases[currentIndex] || [];

                        // Если есть еще предложения для текущего слова
                        if (
                            currentPhraseIndex <
                            currentWordPhrases.length - 1
                        ) {
                            setCurrentPhraseIndex(currentPhraseIndex + 1);
                        } else if (currentIndex < wordsWithPhrasesLength - 1) {
                            // Переходим к следующему слову
                            setCurrentPhraseIndex(0);
                            setCurrentIndex(currentIndex + 1);
                        } else {
                            // Последнее слово/фраза - проверяем актуальное состояние на ошибки
                            setHasCompletedFirstRound(true);

                            const errorIndices = currentResults
                                .map((result, idx) =>
                                    result === false ? idx : -1,
                                )
                                .filter(idx => idx !== -1);

                            if (errorIndices.length > 0) {
                                // Есть ошибки - переходим в режим исправления
                                setIsRetryMode(true);
                                const firstErrorPosition =
                                    getWordAndPhraseIndex(
                                        errorIndices[0],
                                        wordPhrases,
                                    );
                                if (firstErrorPosition) {
                                    setCurrentIndex(
                                        firstErrorPosition.wordIndex,
                                    );
                                    setCurrentPhraseIndex(
                                        firstErrorPosition.phraseIndex,
                                    );
                                }
                            } else {
                                // Все правильно - завершаем этап
                                // Если это последний этап и последнее упражнение выполнено правильно
                                const isLastExercise =
                                    currentIndex ===
                                        wordsWithPhrasesLength - 1 &&
                                    currentPhraseIndex ===
                                        (wordPhrases[currentIndex]?.length ||
                                            1) -
                                            1;
                                if (
                                    isLastStage &&
                                    isLastExercise &&
                                    isCorrect
                                ) {
                                    // Проверяем, что все упражнения выполнены правильно
                                    const allCorrect = currentResults.every(
                                        result => result === true,
                                    );
                                    if (allCorrect) {
                                        // Показываем лоадер и завершаем тренировку
                                        setIsCompleting(true);
                                        setTimeout(() => {
                                            onComplete();
                                        }, 500);
                                        return currentResults;
                                    }
                                }
                                // Обычное завершение этапа
                                onComplete();
                                setCurrentIndex(0);
                                setCurrentPhraseIndex(0);
                                setIsRetryMode(false);
                                setHasCompletedFirstRound(false);
                            }
                        }
                    }

                    return currentResults; // Возвращаем без изменений
                });
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [
        isComplete,
        isCorrect,
        currentIndex,
        currentPhraseIndex,
        isRetryMode,
        exerciseResults,
        wordPhrases,
        wordsWithPhrasesLength,
        isLastStage,
        onComplete,
        setCurrentIndex,
        setCurrentPhraseIndex,
        setExerciseResults,
        setHasCompletedFirstRound,
        setIsRetryMode,
        setIsCompleting,
    ]);
}
