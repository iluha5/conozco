'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressDots } from '../common/ProgressDots';
import {
    useFadeAnimation,
    useRecordResult,
    useExerciseResults,
    useRetryMode,
} from '@/hooks/training';
import { WordDisplay } from './components/WordDisplay';
import { TranslationOptions } from './components/TranslationOptions';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { useTranslationOptions } from './hooks/useTranslationOptions';
import { useOptionSelection } from './hooks/useOptionSelection';
import { useStage2Navigation } from './hooks/useStage2Navigation';
import { useAutoAdvance } from './hooks/useAutoAdvance';
import type { Stage2Props } from './typing';

export function Stage2Training({
    words,
    onComplete,
    isLastStage = false,
}: Stage2Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isCompleting, setIsCompleting] = useState(false);
    const currentWord = words[currentIndex];

    // Shared hooks
    const { fadeIn, animationKey, triggerAnimation } = useFadeAnimation();
    const { exerciseResults, updateResult, setExerciseResults } =
        useExerciseResults({
            totalExercises: words.length,
        });
    const { recordResult } = useRecordResult();
    const retryMode = useRetryMode({
        totalExercises: words.length,
    });

    // Stage-specific hooks
    const { options, regenerateOptions } = useTranslationOptions(
        currentWord,
        currentIndex,
        words,
    );

    const { selectedOption, isCorrect, handleSelectOption, resetSelection } =
        useOptionSelection({
            currentWord: currentWord || words[0],
            currentIndex,
            updateResult,
            recordResult,
        });

    const { isRetryMode, handleNext, findNextError, findNextErrorWithResults } =
        useStage2Navigation({
            currentIndex,
            wordsLength: words.length,
            exerciseResults,
            onComplete,
            retryMode,
        });

    // Reset selection and trigger animation when word changes
    useEffect(() => {
        if (currentWord) {
            triggerAnimation();
            regenerateOptions();
            resetSelection();
        }
    }, [
        currentIndex,
        currentWord,
        regenerateOptions,
        resetSelection,
        triggerAnimation,
    ]);

    // Auto-advance logic
    useAutoAdvance({
        selectedOption,
        isCorrect,
        currentIndex,
        isRetryMode,
        exerciseResults,
        wordsLength: words.length,
        isLastStage,
        onComplete,
        retryMode,
        setExerciseResults,
        setCurrentIndex,
        setIsCompleting,
        resetSelection,
        regenerateOptions,
        triggerAnimation,
        handleNext,
        findNextError,
        findNextErrorWithResults,
    });

    if (!currentWord) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto relative">
            {isCompleting && <LoadingOverlay />}
            <Card
                key={animationKey}
                className={`shadow-xl transition-opacity duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
            >
                <CardHeader>
                    <CardTitle className="text-center text-gray-600">
                        Выбор правильного перевода
                    </CardTitle>
                    <div className="!mt-3">
                        <ProgressDots
                            totalExercises={words.length}
                            completedExercises={
                                exerciseResults.filter(
                                    result => result !== null,
                                ).length
                            }
                            exerciseResults={exerciseResults}
                            currentIndex={currentIndex}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <WordDisplay word={currentWord} />
                    <TranslationOptions
                        options={options}
                        currentWord={currentWord}
                        selectedOption={selectedOption}
                        isCorrect={isCorrect}
                        onSelectOption={handleSelectOption}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
