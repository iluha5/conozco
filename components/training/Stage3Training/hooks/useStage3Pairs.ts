import { useState, useEffect, useCallback } from 'react';
import { createMatchPairs } from '../helpers/createMatchPairs';
import { useI18n } from '@/lib/i18n';
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
    const i18n = useI18n();
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
            i18n.language || 'en',
        );

        setPairs(prevPairs => {
            // Если пары уже существуют, сохраняем состояние matched при переинициализации
            if (prevPairs.length > 0) {
                // Сохраняем состояние matched из предыдущих пар
                return newPairs.map(newPair => {
                    const existingPair = prevPairs.find(
                        p => p.id === newPair.id,
                    );
                    if (existingPair?.matched) {
                        return {
                            ...newPair,
                            matched: true,
                            resultIndex: existingPair.resultIndex,
                            errorCount: existingPair.errorCount,
                        };
                    }
                    return newPair;
                });
            }

            // Первая инициализация
            return newPairs;
        });

        // Перемешиваем переводы только при первой инициализации или при refreshKey
        setShuffledTranslations(prevTranslations => {
            if (prevTranslations.length === 0) {
                const translations = newPairs
                    .map(pair => pair.translation)
                    .sort(() => Math.random() - 0.5);
                return translations;
            }
            return prevTranslations;
        });
    }, [
        words,
        currentBatch,
        wordsPerBatch,
        exerciseResults,
        isRetryMode,
        i18n.language,
    ]);

    useEffect(() => {
        initializePairs();
    }, [initializePairs, refreshKey]);

    return {
        pairs,
        shuffledTranslations,
        setPairs,
    };
}
