'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTrainingStorage } from '@/hooks/training';
import { StageHeader } from './components/StageHeader';
import { ForeignWordsColumn } from './components/ForeignWordsColumn';
import { TranslationsColumn } from './components/TranslationsColumn';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { useStage3Pairs } from './hooks/useStage3Pairs';
import { useStage3Matching } from './hooks/useStage3Matching';
import { useStage3Navigation } from './hooks/useStage3Navigation';
import { useStage3AutoAdvance } from './hooks/useStage3AutoAdvance';
import type { Stage3Props } from './typing';

export function Stage3Training({
    words,
    onComplete,
    isLastStage = false,
}: Stage3Props) {
    const storage = useTrainingStorage();
    const [currentBatch, setCurrentBatch] = useState(0);
    const [exerciseResults, setExerciseResults] = useState<(boolean | null)[]>(
        [],
    );
    const [currentBatchResults, setCurrentBatchResults] = useState<
        (boolean | null)[]
    >([]);
    const [isRetryMode, setIsRetryMode] = useState(false);
    const [_hasCompletedFirstRound, setHasCompletedFirstRound] =
        useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);

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

    // Инициализируем массив результатов для текущего батча
    useEffect(() => {
        setCurrentBatchResults(new Array(currentWords.length).fill(null));
    }, [currentWords.length]);

    const { pairs, shuffledTranslations, setPairs } = useStage3Pairs({
        words,
        currentBatch,
        wordsPerBatch,
        exerciseResults,
        isRetryMode,
        refreshKey,
    });

    const {
        selectedForeign,
        selectedTranslation,
        errorForeign,
        errorTranslation,
        handleForeignClick,
        handleTranslationClick,
        resetSelection,
    } = useStage3Matching({
        pairs,
        currentBatchResults,
        words,
        setPairs,
        setCurrentBatchResults,
        setExerciseResults,
        recordAttempt: storage.recordAttempt,
    });

    const { findNextErrorBatch } = useStage3Navigation({
        totalBatches,
        wordsPerBatch,
        wordsLength: words.length,
        exerciseResults,
    });

    // Сбрасываем выбор при изменении батча
    useEffect(() => {
        resetSelection();
    }, [currentBatch, resetSelection]);

    const allMatched = pairs.every(pair => pair.matched);

    useStage3AutoAdvance({
        allMatched,
        pairsLength: pairs.length,
        currentBatch,
        totalBatches,
        exerciseResults,
        isRetryMode,
        isLastStage,
        onComplete,
        setCurrentBatch,
        setRefreshKey,
        setHasCompletedFirstRound,
        setIsRetryMode,
        setIsCompleting,
        findNextErrorBatch,
    });

    return (
        <div className="max-w-4xl mx-auto relative">
            {isCompleting && <LoadingOverlay />}
            <Card className="shadow-xl">
                <StageHeader
                    currentBatch={currentBatch}
                    totalBatches={totalBatches}
                    totalExercises={currentWords.length}
                    completedExercises={
                        pairs.filter(pair => pair.matched).length
                    }
                    exerciseResults={currentBatchResults}
                    currentIndex={pairs.filter(pair => pair.matched).length}
                />
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-8">
                        <TranslationsColumn
                            shuffledTranslations={shuffledTranslations}
                            pairs={pairs}
                            selectedTranslation={selectedTranslation}
                            errorTranslation={errorTranslation}
                            onTranslationClick={handleTranslationClick}
                        />
                        <ForeignWordsColumn
                            pairs={pairs}
                            selectedForeign={selectedForeign}
                            errorForeign={errorForeign}
                            onForeignClick={handleForeignClick}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
