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
            // If pairs already exist, preserve matched state during reinitialization
            if (prevPairs.length > 0) {
                // Preserve matched state from previous pairs
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

            // First initialization
            return newPairs;
        });

        // Shuffle translations only on first initialization or with refreshKey
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
