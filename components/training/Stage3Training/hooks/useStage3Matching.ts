import { useState, useCallback } from 'react';
import type { TrainingStage } from '@/types/training.types';
import type { MatchPair } from '../typing';

type UseStage3MatchingParams = {
    pairs: MatchPair[];
    currentBatchResults: (boolean | null)[];
    words: Array<{ id: string }>;
    setPairs: React.Dispatch<React.SetStateAction<MatchPair[]>>;
    setCurrentBatchResults: React.Dispatch<
        React.SetStateAction<(boolean | null)[]>
    >;
    setExerciseResults: React.Dispatch<
        React.SetStateAction<(boolean | null)[]>
    >;
    recordAttempt: (
        _stage: TrainingStage,
        _wordId: string,
        _isCorrect: boolean,
    ) => void;
};

export function useStage3Matching({
    pairs,
    currentBatchResults,
    words,
    setPairs,
    setCurrentBatchResults,
    setExerciseResults,
    recordAttempt,
}: UseStage3MatchingParams) {
    const [selectedForeign, setSelectedForeign] = useState<string | null>(null);
    const [selectedTranslation, setSelectedTranslation] = useState<
        string | null
    >(null);
    const [errorForeign, setErrorForeign] = useState<string | null>(null);
    const [errorTranslation, setErrorTranslation] = useState<string | null>(
        null,
    );

    const checkMatch = useCallback(
        async (foreign: string, translation: string) => {
            const pair = pairs.find(
                pairItem =>
                    pairItem.foreign === foreign &&
                    pairItem.translation === translation,
            );

            if (pair) {
                // Determine index for recording result
                let resultIndex: number;

                if (pair.resultIndex !== undefined) {
                    // Pair was already marked (with error) - use the same index
                    resultIndex = pair.resultIndex;
                } else {
                    // Find next available index for recording result
                    resultIndex = currentBatchResults.findIndex(
                        result => result === null,
                    );
                }

                // Correct match
                setPairs(prevPairs =>
                    prevPairs.map(prevPair =>
                        prevPair.id === pair.id
                            ? { ...prevPair, matched: true, resultIndex }
                            : prevPair,
                    ),
                );

                if (resultIndex !== -1) {
                    setCurrentBatchResults(prevResults => {
                        const newResults = [...prevResults];
                        newResults[resultIndex] = true;
                        return newResults;
                    });
                }

                // Find global word index for overall results
                const globalIndex = words.findIndex(
                    word => word.id === pair.id,
                );
                if (globalIndex !== -1) {
                    // In retry mode, if word had error - change to green
                    // In normal mode - just mark as correct
                    setExerciseResults(prevResults => {
                        const newResults = [...prevResults];
                        newResults[globalIndex] = true;
                        return newResults;
                    });
                }

                // Record attempt in localStorage
                recordAttempt(3, pair.id, true);

                await fetch('/api/training', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        wordId: pair.id,
                        stage: 3,
                        isCorrect: true,
                    }),
                });

                // Remove focus from both words after correct matching
                setSelectedForeign(null);
                setSelectedTranslation(null);
            } else {
                // Incorrect match - highlight both words red for 0.2 seconds
                setErrorForeign(foreign);
                setErrorTranslation(translation);

                // Remove highlight and focus after 0.2 seconds
                setTimeout(() => {
                    setErrorForeign(null);
                    setErrorTranslation(null);
                    setSelectedForeign(null);
                    setSelectedTranslation(null);
                }, 200);

                const wordPair = pairs.find(
                    pairItem => pairItem.foreign === foreign,
                );
                if (wordPair) {
                    // Increase error count for this pair
                    const currentErrorCount = (wordPair.errorCount || 0) + 1;

                    // Find global word index
                    const globalIndex = words.findIndex(
                        word => word.id === wordPair.id,
                    );

                    // Mark as error only if error limit exceeded (3) and not already marked
                    if (
                        currentErrorCount >= 3 &&
                        wordPair.resultIndex === undefined
                    ) {
                        // Find next available index for recording result
                        const nextResultIndex = currentBatchResults.findIndex(
                            result => result === null,
                        );
                        if (nextResultIndex !== -1) {
                            setCurrentBatchResults(prevResults => {
                                const newResults = [...prevResults];
                                newResults[nextResultIndex] = false;
                                return newResults;
                            });

                            // Save index in pair
                            setPairs(prevPairs =>
                                prevPairs.map(prevPair =>
                                    prevPair.id === wordPair.id
                                        ? {
                                              ...prevPair,
                                              errorCount: currentErrorCount,
                                              resultIndex: nextResultIndex,
                                          }
                                        : prevPair,
                                ),
                            );
                        }

                        if (globalIndex !== -1) {
                            setExerciseResults(prevResults => {
                                const newResults = [...prevResults];
                                newResults[globalIndex] = false;
                                return newResults;
                            });
                        }
                    } else {
                        // Just increase error count
                        setPairs(prevPairs =>
                            prevPairs.map(prevPair =>
                                prevPair.id === wordPair.id
                                    ? {
                                          ...prevPair,
                                          errorCount: currentErrorCount,
                                      }
                                    : prevPair,
                            ),
                        );
                    }

                    // Record attempt in localStorage
                    recordAttempt(3, wordPair.id, false);

                    await fetch('/api/training', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            wordId: wordPair.id,
                            stage: 3,
                            isCorrect: false,
                        }),
                    });
                }
            }
        },
        [
            pairs,
            currentBatchResults,
            words,
            setPairs,
            setCurrentBatchResults,
            setExerciseResults,
            recordAttempt,
        ],
    );

    const handleForeignClick = useCallback(
        (foreign: string) => {
            const pair = pairs.find(pairItem => pairItem.foreign === foreign);
            if (pair?.matched) return;

            setSelectedForeign(foreign);

            if (selectedTranslation) {
                checkMatch(foreign, selectedTranslation);
            }
        },
        [pairs, selectedTranslation, checkMatch],
    );

    const handleTranslationClick = useCallback(
        (translation: string) => {
            const pair = pairs.find(
                pairItem => pairItem.translation === translation,
            );
            if (pair?.matched) return;

            setSelectedTranslation(translation);

            if (selectedForeign) {
                checkMatch(selectedForeign, translation);
            }
        },
        [pairs, selectedForeign, checkMatch],
    );

    const resetSelection = useCallback(() => {
        setSelectedForeign(null);
        setSelectedTranslation(null);
        setErrorForeign(null);
        setErrorTranslation(null);
    }, []);

    return {
        selectedForeign,
        selectedTranslation,
        errorForeign,
        errorTranslation,
        handleForeignClick,
        handleTranslationClick,
        resetSelection,
    };
}
