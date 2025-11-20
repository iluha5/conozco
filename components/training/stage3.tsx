'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressDots } from './progress-dots';
import { useTrainingStorage } from '@/hooks/training';

type Language = {
    id: string;
    code: string;
    name: string;
};

type Word = {
    id: string;
    userId: string;
    baseWordId?: string;
    customWord?: string;
    languageId: string;
    language: Language;
    status: 'NOT_LEARNED' | 'LEARNED';
    createdAt: string;
    updatedAt: string;
    baseWord?: {
        id: string;
        word: string;
        partOfSpeech: {
            id: string;
            name: string;
            displayName: string;
        };
        languageId: string;
        translations: Array<{
            translation: string;
            priority: number;
        }>;
        examples: Array<{
            example: string;
            translation: string;
            pronoun: {
                pronoun: string;
            };
            sentenceType?: {
                id: number;
                code: string;
                displayName: string;
                isNegative: boolean;
                isQuestion: boolean;
            };
        }>;
    };
    customTranslations?: Array<{
        id: number;
        translation: string;
    }>;
};

type Stage3Props = {
    words: Word[];
    onComplete: () => void;
};

type MatchPair = {
    id: string;
    foreign: string;
    translation: string;
    matched: boolean;
    errorCount?: number;
    resultIndex?: number; // Индекс в массиве currentBatchResults
};

export function Stage3Training({ words, onComplete }: Stage3Props) {
    const storage = useTrainingStorage();
    const [currentBatch, setCurrentBatch] = useState(0);
    const [pairs, setPairs] = useState<MatchPair[]>([]);
    const [shuffledTranslations, setShuffledTranslations] = useState<string[]>(
        [],
    );
    const [selectedForeign, setSelectedForeign] = useState<string | null>(null);
    const [selectedTranslation, setSelectedTranslation] = useState<
        string | null
    >(null);
    const [stats, setStats] = useState({ correct: 0, total: 0 });
    const [errorForeign, setErrorForeign] = useState<string | null>(null);
    const [errorTranslation, setErrorTranslation] = useState<string | null>(
        null,
    );
    const [exerciseResults, setExerciseResults] = useState<(boolean | null)[]>(
        [],
    );
    const [currentBatchResults, setCurrentBatchResults] = useState<
        (boolean | null)[]
    >([]);
    const [isRetryMode, setIsRetryMode] = useState(false);
    const [hasCompletedFirstRound, setHasCompletedFirstRound] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const wordsPerBatch = 10;
    const totalBatches = Math.ceil(words.length / wordsPerBatch);
    const currentWords = words.slice(
        currentBatch * wordsPerBatch,
        (currentBatch + 1) * wordsPerBatch,
    );

    // Инициализируем массив результатов упражнений
    useEffect(() => {
        setExerciseResults(new Array(words.length).fill(null));
    }, [words.length]);

    useEffect(() => {
        const currentBatchWords = words.slice(
            currentBatch * wordsPerBatch,
            (currentBatch + 1) * wordsPerBatch,
        );

        const newPairs: MatchPair[] = currentBatchWords.map(word => {
            const globalIndex = words.findIndex(w => w.id === word.id);
            const hasError = exerciseResults[globalIndex] === false;

            return {
                id: word.id,
                foreign: word.baseWord?.word || word.customWord || '',
                translation:
                    word.customTranslations &&
                    word.customTranslations.length > 0
                        ? word.customTranslations[0].translation
                        : word.baseWord?.translations &&
                            word.baseWord.translations.length > 0
                          ? word.baseWord.translations[0].translation
                          : 'Нет перевода',
                matched: false,
                errorCount: hasError && isRetryMode ? 0 : 0, // Сбрасываем счетчик ошибок при повторении
            };
        });

        setPairs(newPairs);

        // Инициализируем массив результатов для текущего батча
        setCurrentBatchResults(new Array(currentBatchWords.length).fill(null));

        // Перемешиваем переводы
        const translations = newPairs
            .map(p => p.translation)
            .sort(() => Math.random() - 0.5);
        setShuffledTranslations(translations);

        setSelectedForeign(null);
        setSelectedTranslation(null);
        setErrorForeign(null);
        setErrorTranslation(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentBatch, words, isRetryMode, refreshKey]);

    const handleForeignClick = (foreign: string) => {
        const pair = pairs.find(p => p.foreign === foreign);
        if (pair?.matched) return;

        setSelectedForeign(foreign);

        if (selectedTranslation) {
            checkMatch(foreign, selectedTranslation);
        }
    };

    const handleTranslationClick = (translation: string) => {
        const pair = pairs.find(p => p.translation === translation);
        if (pair?.matched) return;

        setSelectedTranslation(translation);

        if (selectedForeign) {
            checkMatch(selectedForeign, translation);
        }
    };

    const checkMatch = async (foreign: string, translation: string) => {
        const pair = pairs.find(
            p => p.foreign === foreign && p.translation === translation,
        );

        if (pair) {
            // Определяем индекс для записи результата
            let resultIndex: number;

            if (pair.resultIndex !== undefined) {
                // Пара уже была отмечена (с ошибкой) - используем тот же индекс
                resultIndex = pair.resultIndex;
            } else {
                // Находим следующий свободный индекс для записи результата
                resultIndex = currentBatchResults.findIndex(r => r === null);
            }

            // Правильное совпадение
            setPairs(prev =>
                prev.map(p =>
                    p.id === pair.id ? { ...p, matched: true, resultIndex } : p,
                ),
            );

            if (resultIndex !== -1) {
                setCurrentBatchResults(prev => {
                    const newResults = [...prev];
                    newResults[resultIndex] = true;
                    return newResults;
                });
            }

            // Находим глобальный индекс слова для общих результатов
            const globalIndex = words.findIndex(w => w.id === pair.id);
            if (globalIndex !== -1) {
                // В режиме повторения, если слово было с ошибкой - меняем на зеленое
                // В обычном режиме - просто отмечаем как правильное
                setExerciseResults(prev => {
                    const newResults = [...prev];
                    newResults[globalIndex] = true;
                    return newResults;
                });
            }

            // Записываем попытку в localStorage
            storage.recordAttempt(3, pair.id, true);

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

            setStats(prev => ({
                correct: prev.correct + 1,
                total: prev.total + 1,
            }));

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

            const wordPair = pairs.find(p => p.foreign === foreign);
            if (wordPair) {
                // Увеличиваем счетчик ошибок для этой пары
                const currentErrorCount = (wordPair.errorCount || 0) + 1;

                // Находим глобальный индекс слова
                const globalIndex = words.findIndex(w => w.id === wordPair.id);

                // Отмечаем как ошибку только если превышен лимит ошибок (3) и еще не отмечено
                if (
                    currentErrorCount >= 3 &&
                    wordPair.resultIndex === undefined
                ) {
                    // Находим следующий свободный индекс для записи результата
                    const nextResultIndex = currentBatchResults.findIndex(
                        r => r === null,
                    );
                    if (nextResultIndex !== -1) {
                        setCurrentBatchResults(prev => {
                            const newResults = [...prev];
                            newResults[nextResultIndex] = false;
                            return newResults;
                        });

                        // Сохраняем индекс в паре
                        setPairs(prev =>
                            prev.map(p =>
                                p.id === wordPair.id
                                    ? {
                                          ...p,
                                          errorCount: currentErrorCount,
                                          resultIndex: nextResultIndex,
                                      }
                                    : p,
                            ),
                        );
                    }

                    if (globalIndex !== -1) {
                        setExerciseResults(prev => {
                            const newResults = [...prev];
                            newResults[globalIndex] = false;
                            return newResults;
                        });
                    }
                } else {
                    // Просто увеличиваем счетчик ошибок
                    setPairs(prev =>
                        prev.map(p =>
                            p.id === wordPair.id
                                ? { ...p, errorCount: currentErrorCount }
                                : p,
                        ),
                    );
                }

                // Записываем попытку в localStorage
                storage.recordAttempt(3, wordPair.id, false);

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

            setStats(prev => ({
                correct: prev.correct,
                total: prev.total + 1,
            }));
        }
    };

    const allMatched = pairs.every(p => p.matched);

    // Функция для поиска следующей ошибки (батчи с ошибками)
    const findNextErrorBatch = useCallback(
        (startBatch: number) => {
            // Ищем следующий батч с ошибками после текущего
            for (let i = startBatch + 1; i < totalBatches; i++) {
                const batchStart = i * wordsPerBatch;
                const batchEnd = Math.min(
                    (i + 1) * wordsPerBatch,
                    words.length,
                );
                const batchResults = exerciseResults.slice(
                    batchStart,
                    batchEnd,
                );
                if (batchResults.some(r => r === false)) {
                    return i;
                }
            }
            // Если не нашли, ищем с начала до текущего батча
            for (let i = 0; i <= startBatch; i++) {
                const batchStart = i * wordsPerBatch;
                const batchEnd = Math.min(
                    (i + 1) * wordsPerBatch,
                    words.length,
                );
                const batchResults = exerciseResults.slice(
                    batchStart,
                    batchEnd,
                );
                if (batchResults.some(r => r === false)) {
                    return i;
                }
            }
            return -1; // Ошибок больше нет
        },
        [totalBatches, wordsPerBatch, words.length, exerciseResults],
    );

    // Автоматический переход к следующей группе или завершение этапа
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (allMatched && pairs.length > 0) {
            const timer = setTimeout(() => {
                if (currentBatch < totalBatches - 1) {
                    setCurrentBatch(currentBatch + 1);
                } else {
                    // Завершили все батчи первый раз
                    setHasCompletedFirstRound(true);

                    // Проверяем, есть ли ошибки во всех батчах
                    const hasAnyErrors = exerciseResults.some(r => r === false);

                    if (hasAnyErrors) {
                        // Есть ошибки - переходим в режим исправления
                        setIsRetryMode(true);
                        const firstErrorBatch = findNextErrorBatch(-1); // Ищем первый батч с ошибками
                        if (firstErrorBatch !== -1) {
                            setCurrentBatch(firstErrorBatch);
                        }
                    } else {
                        // Все правильно - завершаем этап
                        onComplete();
                        setCurrentBatch(0);
                        setStats({ correct: 0, total: 0 });
                        setIsRetryMode(false);
                        setHasCompletedFirstRound(false);
                    }
                }
            }, 1500); // Задержка 1.5 секунды для визуального подтверждения

            return () => clearTimeout(timer);
        } else if (isRetryMode && allMatched && pairs.length > 0) {
            // В режиме повторения, когда завершили текущий батч
            const timer = setTimeout(() => {
                const nextErrorBatch = findNextErrorBatch(currentBatch);

                if (nextErrorBatch === -1) {
                    // Все ошибки исправлены - завершаем этап
                    onComplete();
                    setCurrentBatch(0);
                    setStats({ correct: 0, total: 0 });
                    setIsRetryMode(false);
                    setHasCompletedFirstRound(false);
                } else if (nextErrorBatch === currentBatch) {
                    // Это единственный батч с ошибками - перезагружаем его
                    setRefreshKey(prev => prev + 1);
                } else {
                    // Переходим к следующему батчу с ошибками
                    setCurrentBatch(nextErrorBatch);
                }
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [
        allMatched,
        currentBatch,
        totalBatches,
        pairs.length,
        onComplete,
        isRetryMode,
        exerciseResults,
        findNextErrorBatch,
    ]);

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="text-center text-gray-600">
                        Сопоставление слов
                    </CardTitle>
                    <p className="text-center text-sm text-gray-500">
                        Группа {currentBatch + 1} из {totalBatches}
                    </p>
                    <div className="!mt-3">
                        <ProgressDots
                            totalExercises={currentWords.length}
                            completedExercises={
                                pairs.filter(p => p.matched).length
                            }
                            exerciseResults={currentBatchResults}
                            currentIndex={pairs.filter(p => p.matched).length}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center text-gray-600">
                        Соедините иностранные слова с их переводами
                    </p>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Левая колонка - иностранные слова */}
                        <div className="space-y-3 transition-all duration-200 ease-in-out">
                            {pairs
                                .sort((a, b) => {
                                    // Сначала matched пары, затем неугаданные
                                    if (a.matched && !b.matched) return -1;
                                    if (!a.matched && b.matched) return 1;
                                    return 0;
                                })
                                .map(pair => (
                                    <Button
                                        key={pair.id}
                                        variant={
                                            pair.matched
                                                ? 'outline'
                                                : selectedForeign ===
                                                    pair.foreign
                                                  ? 'default'
                                                  : 'outline'
                                        }
                                        className={`w-full h-auto py-4 text-lg transition-all duration-200 ease-in-out ${
                                            pair.matched
                                                ? 'bg-green-500 border-green-500 text-white cursor-not-allowed'
                                                : errorForeign === pair.foreign
                                                  ? 'bg-red-500 border-red-500 text-white'
                                                  : ''
                                        }`}
                                        onClick={() =>
                                            handleForeignClick(pair.foreign)
                                        }
                                        disabled={pair.matched}
                                    >
                                        {pair.foreign}
                                    </Button>
                                ))}
                        </div>

                        {/* Правая колонка - переводы */}
                        <div className="space-y-3 transition-all duration-200 ease-in-out">
                            {shuffledTranslations
                                .sort((a, b) => {
                                    // Сначала matched переводы, затем неугаданные
                                    const pairA = pairs.find(
                                        p => p.translation === a,
                                    );
                                    const pairB = pairs.find(
                                        p => p.translation === b,
                                    );
                                    const isMatchedA = pairA?.matched || false;
                                    const isMatchedB = pairB?.matched || false;

                                    if (isMatchedA && !isMatchedB) return -1;
                                    if (!isMatchedA && isMatchedB) return 1;
                                    return 0;
                                })
                                .map((translation, index) => {
                                    const pair = pairs.find(
                                        p => p.translation === translation,
                                    );
                                    const isMatched = pair?.matched || false;

                                    return (
                                        <Button
                                            key={translation}
                                            variant={
                                                isMatched
                                                    ? 'outline'
                                                    : selectedTranslation ===
                                                        translation
                                                      ? 'default'
                                                      : 'outline'
                                            }
                                            className={`w-full h-auto py-4 text-lg transition-all duration-500 ease-in-out ${
                                                isMatched
                                                    ? 'bg-green-500 border-green-500 text-white cursor-not-allowed'
                                                    : errorTranslation ===
                                                        translation
                                                      ? 'bg-red-500 border-red-500 text-white'
                                                      : ''
                                            }`}
                                            onClick={() =>
                                                handleTranslationClick(
                                                    translation,
                                                )
                                            }
                                            disabled={isMatched}
                                        >
                                            {translation}
                                        </Button>
                                    );
                                })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
