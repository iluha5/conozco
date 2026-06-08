'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    useFadeAnimation,
    useRecordResult,
    useExerciseResults,
    useRetryMode,
    useSpeech,
} from '@/hooks/training';
import { getWordText } from '@/lib/training-utils';
import { StageHeader } from './components/StageHeader';
import { PlayWordButton } from './components/PlayWordButton';
import { WordBuilder } from './components/WordBuilder';
import { LettersGrid } from './components/LettersGrid';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { useStage6Letters } from './hooks/useStage6Letters';
import { useStage6WordBuilding } from './hooks/useStage6WordBuilding';
import { useStage6Navigation } from './hooks/useStage6Navigation';
import { useStage6AutoAdvance } from './hooks/useStage6AutoAdvance';
import type { Stage6Props } from './typing';
import { useTranslation } from '@/lib/i18n';

export function Stage6Training({
    words,
    onComplete,
    isLastStage = false,
}: Stage6Props) {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [backgroundFlash, setBackgroundFlash] = useState<
        'green' | 'red' | null
    >(null);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [completedWordId, setCompletedWordId] = useState<string | null>(null);
    const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(
        null,
    );
    const [isCompleting, setIsCompleting] = useState(false);

    // Only base words (exclude custom words)
    const baseWords = words.filter(word => word.baseWordId && !word.customWord);
    const currentWord = baseWords[currentIndex];

    const { fadeIn, animationKey, triggerAnimation } = useFadeAnimation();
    const { exerciseResults, updateResult, setExerciseResults } =
        useExerciseResults({
            totalExercises: baseWords.length,
        });
    const { recordResult } = useRecordResult();
    const {
        isRetryMode,
        findNextErrorWithResults,
        getErrorIndices,
        setIsRetryMode,
        setHasCompletedFirstRound,
    } = useRetryMode();
    const {
        speak,
        prime,
        isPlaying,
        isSupported: speechSupported,
        isReady: speechReady,
    } = useSpeech({
        languageCode: currentWord?.language.code || 'en',
    });

    const currentWordText = currentWord ? getWordText(currentWord) : '';

    const { letters, setLetters, resetLetters } = useStage6Letters({
        currentWord: currentWordText,
        animationKey,
    });

    const {
        userWord,
        isComplete,
        isCorrect,
        flashingLetter,
        handleLetterClick,
        handleRemoveFromWord,
        resetWordBuilding,
    } = useStage6WordBuilding({
        currentWord: currentWordText,
        letters,
        setLetters,
    });

    const findNextError = useCallback(
        (startIndex: number) => {
            return findNextErrorWithResults(startIndex, exerciseResults);
        },
        [findNextErrorWithResults, exerciseResults],
    );

    const { handleNext } = useStage6Navigation({
        currentIndex,
        baseWordsLength: baseWords.length,
        exerciseResults,
        getErrorIndices,
        setIsRetryMode,
        setHasCompletedFirstRound,
    });

    useEffect(() => {
        if (currentWord) {
            setBackgroundFlash(null);
            setShowResultPopup(false);
            setCompletedWordId(null);
            setLastCompletedIndex(null);

            triggerAnimation();
            resetLetters();
            resetWordBuilding();

            if (speechSupported && speechReady && currentWordText) {
                const timer = setTimeout(() => {
                    speak(currentWordText);
                }, 150);
                return () => clearTimeout(timer);
            }
        }
    }, [
        currentIndex,
        resetLetters,
        resetWordBuilding,
        triggerAnimation,
        currentWord,
        speak,
        speechSupported,
        speechReady,
        currentWordText,
    ]);

    useEffect(() => {
        if (
            isComplete &&
            isCorrect !== null &&
            currentWord &&
            completedWordId === null &&
            lastCompletedIndex !== currentIndex
        ) {
            setCompletedWordId(currentWord.id);
            setLastCompletedIndex(currentIndex);

            setExerciseResults(prevResults => {
                const newResults = [...prevResults];
                // Retry mode overwrites existing results; normal mode only fills empty slots
                if (isRetryMode || newResults[currentIndex] === null) {
                    newResults[currentIndex] = isCorrect;
                }
                return newResults;
            });

            setBackgroundFlash(isCorrect ? 'green' : 'red');
            setShowResultPopup(true);

            updateResult(currentIndex, isCorrect);

            recordResult(6, currentWord.id, isCorrect);
        } else if (
            currentWord &&
            completedWordId !== null &&
            currentWord.id !== completedWordId
        ) {
            setShowResultPopup(false);
            setBackgroundFlash(null);
        }
    }, [
        isComplete,
        isCorrect,
        currentIndex,
        currentWord,
        completedWordId,
        lastCompletedIndex,
        isRetryMode,
        setExerciseResults,
        updateResult,
        recordResult,
    ]);

    useStage6AutoAdvance({
        isComplete,
        isCorrect,
        currentIndex,
        isRetryMode,
        exerciseResults,
        baseWordsLength: baseWords.length,
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
        initializeLetters: resetLetters,
        resetWordBuilding,
        setBackgroundFlash,
        setShowResultPopup,
        speak,
        currentWordText,
        speechSupported,
        speechReady,
    });

    const handleLetterClickWrapper = useCallback(
        (index: number) => {
            handleLetterClick(index);
        },
        [handleLetterClick],
    );

    const handlePlayWord = useCallback(() => {
        prime();
        speak(currentWordText, { showErrorToast: true });
    }, [prime, speak, currentWordText]);

    if (!currentWord) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-gray-600">
                        {t(
                            'No base words for training. Add words from the dictionary!',
                        )}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-2xl mx-auto relative">
            {isCompleting && <LoadingOverlay />}
            <Card
                key={animationKey}
                className={`shadow-xl transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'} ${
                    backgroundFlash === 'green'
                        ? 'bg-green-50 border-green-400'
                        : backgroundFlash === 'red'
                          ? 'bg-red-50 border-red-400'
                          : ''
                }`}
            >
                <StageHeader
                    totalExercises={baseWords.length}
                    completedExercises={
                        exerciseResults.filter(result => result !== null).length
                    }
                    exerciseResults={exerciseResults}
                    currentIndex={currentIndex}
                />
                <CardContent className="space-y-6">
                    <PlayWordButton
                        onPlay={handlePlayWord}
                        isPlaying={isPlaying}
                        speechSupported={speechSupported}
                    />
                    <WordBuilder
                        userWord={userWord}
                        isComplete={isComplete}
                        showResultPopup={showResultPopup}
                        isCorrect={isCorrect}
                        onRemoveLetter={handleRemoveFromWord}
                    />
                    <LettersGrid
                        letters={letters}
                        flashingLetter={flashingLetter}
                        isComplete={isComplete}
                        onLetterClick={handleLetterClickWrapper}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
