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
        // Auto-advance only on a correct answer
        if (isComplete && isCorrect) {
            const delay = 1000;
            const timer = setTimeout(() => {
                setExerciseResults(currentResults => {
                    const currentExerciseIndex =
                        wordPhrases
                            .slice(0, currentIndex)
                            .reduce(
                                (total, phrases) => total + phrases.length,
                                0,
                            ) + currentPhraseIndex;

                    if (isRetryMode) {
                        const updatedResults = [...currentResults];
                        updatedResults[currentExerciseIndex] = true;

                        const nextErrorIndex = findNextErrorWithResults(
                            currentExerciseIndex,
                            updatedResults,
                        );

                        if (nextErrorIndex === -1) {
                            if (isLastStage) {
                                setIsCompleting(true);
                                setTimeout(() => {
                                    onComplete();
                                }, 500);
                            } else {
                                // Extra delay so user sees all green dots
                                setTimeout(() => {
                                    onComplete();
                                    setCurrentIndex(0);
                                    setCurrentPhraseIndex(0);
                                    setIsRetryMode(false);
                                    setHasCompletedFirstRound(false);
                                }, 1500);
                            }
                        } else {
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

                        return updatedResults;
                    } else {
                        // Re-read state inside the updater so transitions on the
                        // last phrase use up-to-date results
                        const currentWordPhrases =
                            wordPhrases[currentIndex] || [];

                        if (
                            currentPhraseIndex <
                            currentWordPhrases.length - 1
                        ) {
                            setCurrentPhraseIndex(currentPhraseIndex + 1);
                        } else if (currentIndex < wordsWithPhrasesLength - 1) {
                            setCurrentPhraseIndex(0);
                            setCurrentIndex(currentIndex + 1);
                        } else {
                            setHasCompletedFirstRound(true);

                            const errorIndices = currentResults
                                .map((result, idx) =>
                                    result === false ? idx : -1,
                                )
                                .filter(idx => idx !== -1);

                            if (errorIndices.length > 0) {
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
                                    const allCorrect = currentResults.every(
                                        result => result === true,
                                    );
                                    if (allCorrect) {
                                        setIsCompleting(true);
                                        setTimeout(() => {
                                            onComplete();
                                        }, 500);
                                        return currentResults;
                                    }
                                }
                                onComplete();
                                setCurrentIndex(0);
                                setCurrentPhraseIndex(0);
                                setIsRetryMode(false);
                                setHasCompletedFirstRound(false);
                            }
                        }
                    }

                    return currentResults;
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
