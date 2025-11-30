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
                // Определяем индекс для записи результата
                let resultIndex: number;

                if (pair.resultIndex !== undefined) {
                    // Пара уже была отмечена (с ошибкой) - используем тот же индекс
                    resultIndex = pair.resultIndex;
                } else {
                    // Находим следующий свободный индекс для записи результата
                    resultIndex = currentBatchResults.findIndex(
                        result => result === null,
                    );
                }

                // Правильное совпадение
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

                // Находим глобальный индекс слова для общих результатов
                const globalIndex = words.findIndex(
                    word => word.id === pair.id,
                );
                if (globalIndex !== -1) {
                    // В режиме повторения, если слово было с ошибкой - меняем на зеленое
                    // В обычном режиме - просто отмечаем как правильное
                    setExerciseResults(prevResults => {
                        const newResults = [...prevResults];
                        newResults[globalIndex] = true;
                        return newResults;
                    });
                }

                // Записываем попытку в localStorage
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

                // Снимаем фокус с обоих слов после правильного сопоставления
                setSelectedForeign(null);
                setSelectedTranslation(null);
            } else {
                // Неправильное совпадение - подсвечиваем оба слова красным на 0.2 секунды
                setErrorForeign(foreign);
                setErrorTranslation(translation);

                // Снимаем подсветку и фокус через 0.2 секунды
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
                    // Увеличиваем счетчик ошибок для этой пары
                    const currentErrorCount = (wordPair.errorCount || 0) + 1;

                    // Находим глобальный индекс слова
                    const globalIndex = words.findIndex(
                        word => word.id === wordPair.id,
                    );

                    // Отмечаем как ошибку только если превышен лимит ошибок (3) и еще не отмечено
                    if (
                        currentErrorCount >= 3 &&
                        wordPair.resultIndex === undefined
                    ) {
                        // Находим следующий свободный индекс для записи результата
                        const nextResultIndex = currentBatchResults.findIndex(
                            result => result === null,
                        );
                        if (nextResultIndex !== -1) {
                            setCurrentBatchResults(prevResults => {
                                const newResults = [...prevResults];
                                newResults[nextResultIndex] = false;
                                return newResults;
                            });

                            // Сохраняем индекс в паре
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
                        // Просто увеличиваем счетчик ошибок
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

                    // Записываем попытку в localStorage
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
