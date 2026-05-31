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
    speechSupported: boolean;
    speechReady: boolean;
};

const AUTO_SPEAK_DELAY_MS = 150;

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
    speechSupported,
    speechReady,
}: UseStage6AutoAdvanceParams) {
    useEffect(() => {
        if (isComplete && isCorrect !== null) {
            const delay = isCorrect ? 1000 : 2000;
            const timer = setTimeout(() => {
                if (isRetryMode) {
                    if (isCorrect) {
                        setExerciseResults(currentResults => {
                            const updatedResults = [...currentResults];
                            updatedResults[currentIndex] = true;

                            const nextErrorIndex = findNextErrorWithResults(
                                currentIndex,
                                updatedResults,
                            );
                            if (nextErrorIndex === -1) {
                                // Extra delay so user sees all green dots
                                setTimeout(() => {
                                    onComplete();
                                    setCurrentIndex(0);
                                    setIsRetryMode(false);
                                    setHasCompletedFirstRound(false);
                                }, 1500);
                            } else {
                                setCurrentIndex(nextErrorIndex);
                            }
                            return updatedResults;
                        });
                    } else {
                        const nextErrorIndex = findNextError(currentIndex);
                        if (
                            nextErrorIndex === -1 ||
                            nextErrorIndex === currentIndex
                        ) {
                            // Only error left -- stay on it but reload the card
                            triggerAnimation();
                            initializeLetters();
                            resetWordBuilding();
                            setBackgroundFlash(null);
                            setShowResultPopup(false);

                            if (
                                speechSupported &&
                                speechReady &&
                                currentWordText
                            ) {
                                setTimeout(() => {
                                    speak(currentWordText);
                                }, AUTO_SPEAK_DELAY_MS);
                            }
                        } else {
                            setCurrentIndex(nextErrorIndex);
                        }
                    }
                } else {
                    const result = handleNext();

                    if (result.type === 'next') {
                        setCurrentIndex(result.nextIndex);
                    } else if (result.type === 'retry') {
                        setIsRetryMode(true);
                        setHasCompletedFirstRound(true);
                        setCurrentIndex(result.nextIndex);
                    } else if (result.type === 'complete') {
                        if (
                            isLastStage &&
                            currentIndex === baseWordsLength - 1 &&
                            isCorrect
                        ) {
                            const allCorrect = exerciseResults.every(
                                result => result === true,
                            );
                            if (allCorrect) {
                                setIsCompleting(true);
                                setTimeout(() => {
                                    onComplete();
                                }, 500);
                                return;
                            }
                        }
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
        speechSupported,
        speechReady,
    ]);
}
