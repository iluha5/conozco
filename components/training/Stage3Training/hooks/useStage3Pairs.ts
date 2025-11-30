import { useState, useEffect, useCallback } from 'react';
import { createMatchPairs } from '../helpers/createMatchPairs';
import type { Word } from '@/types/training.types';
import type { MatchPair } from '../typing';

type UseStage3PairsParams = {
    words: Word[];
    currentBatch: number;
    wordsPerBatch: number;
    exerciseResults: (boolean | null)[];
    isRetryMode: boolean;
    refreshKey: number;
};

export function useStage3Pairs({
    words,
    currentBatch,
    wordsPerBatch,
    exerciseResults,
    isRetryMode,
    refreshKey,
}: UseStage3PairsParams) {
    const [pairs, setPairs] = useState<MatchPair[]>([]);
    const [shuffledTranslations, setShuffledTranslations] = useState<string[]>(
        [],
    );

    const initializePairs = useCallback(() => {
        const currentBatchWords = words.slice(
            currentBatch * wordsPerBatch,
            (currentBatch + 1) * wordsPerBatch,
        );

        const newPairs = createMatchPairs(
            currentBatchWords,
            exerciseResults,
            isRetryMode,
        );

        setPairs(newPairs);

        // Перемешиваем переводы
        const translations = newPairs
            .map(pair => pair.translation)
            .sort(() => Math.random() - 0.5);
        setShuffledTranslations(translations);
    }, [words, currentBatch, wordsPerBatch, exerciseResults, isRetryMode]);

    useEffect(() => {
        initializePairs();
    }, [initializePairs, refreshKey]);

    return {
        pairs,
        shuffledTranslations,
        setPairs,
    };
}
