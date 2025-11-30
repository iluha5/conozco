import { useCallback } from 'react';
import { getWordAndPhraseIndex } from '../helpers/getWordAndPhraseIndex';
import { findNextError } from '../helpers/findNextError';
import type { Phrase } from '../typing';

type UseStage5NavigationParams = {
    currentIndex: number;
    currentPhraseIndex: number;
    wordPhrases: Phrase[][];
    wordsWithPhrasesLength: number;
    exerciseResults: (boolean | null)[];
    onComplete: () => void;
};

export function useStage5Navigation({
    currentIndex,
    currentPhraseIndex,
    wordPhrases,
    wordsWithPhrasesLength,
    exerciseResults,
    onComplete: _onComplete,
}: UseStage5NavigationParams) {
    // Функция для преобразования линейного индекса упражнения в (wordIndex, phraseIndex)
    const getWordAndPhraseIndexFromExercise = useCallback(
        (exerciseIndex: number) => {
            return getWordAndPhraseIndex(exerciseIndex, wordPhrases);
        },
        [wordPhrases],
    );

    // Функция для поиска следующей ошибки (использует текущее состояние)
    const findNextErrorIndex = useCallback(
        (currentExerciseIndex: number) => {
            return findNextError(currentExerciseIndex, exerciseResults);
        },
        [exerciseResults],
    );

    const handleNext = useCallback(() => {
        // Обычный режим (не retry)
        const currentWordPhrases = wordPhrases[currentIndex] || [];

        // Если есть еще предложения для текущего слова
        if (currentPhraseIndex < currentWordPhrases.length - 1) {
            return {
                type: 'nextPhrase' as const,
                wordIndex: currentIndex,
                phraseIndex: currentPhraseIndex + 1,
            };
        } else {
            // Переходим к следующему слову
            if (currentIndex < wordsWithPhrasesLength - 1) {
                return {
                    type: 'nextWord' as const,
                    wordIndex: currentIndex + 1,
                    phraseIndex: 0,
                };
            } else {
                // Завершили все фразы первый раз
                // Проверяем, есть ли ошибки
                const errorIndices = exerciseResults
                    .map((result, idx) => (result === false ? idx : -1))
                    .filter(idx => idx !== -1);

                if (errorIndices.length > 0) {
                    // Есть ошибки - переходим в режим исправления
                    const firstErrorPosition =
                        getWordAndPhraseIndexFromExercise(errorIndices[0]);
                    if (firstErrorPosition) {
                        return {
                            type: 'retry' as const,
                            wordIndex: firstErrorPosition.wordIndex,
                            phraseIndex: firstErrorPosition.phraseIndex,
                        };
                    }
                } else {
                    // Все правильно - завершаем этап
                    return { type: 'complete' as const };
                }
            }
        }
        return {
            type: 'nextPhrase' as const,
            wordIndex: currentIndex,
            phraseIndex: currentPhraseIndex,
        };
    }, [
        currentIndex,
        currentPhraseIndex,
        wordPhrases,
        wordsWithPhrasesLength,
        exerciseResults,
        getWordAndPhraseIndexFromExercise,
    ]);

    return {
        getWordAndPhraseIndex: getWordAndPhraseIndexFromExercise,
        findNextError: findNextErrorIndex,
        handleNext,
    };
}
