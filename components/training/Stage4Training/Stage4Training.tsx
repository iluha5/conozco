'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stage4SettingsModal } from '../common/Stage4SettingsModal';
import { useStage4Settings as useStage4SettingsHook } from '@/hooks/shared/use-training-settings';
import { useTrainingStorage } from '@/hooks/training';
import { useHashDialog } from '@/hooks/shared';
import { StageHeader } from './components/StageHeader';
import { TranslationDisplay } from './components/TranslationDisplay';
import { WordBuilder } from './components/WordBuilder';
import { LettersGrid } from './components/LettersGrid';
import { NextButton } from './components/NextButton';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { useStage4Letters } from './hooks/useStage4Letters';
import { useStage4WordBuilding } from './hooks/useStage4WordBuilding';
import { useStage4Navigation } from './hooks/useStage4Navigation';
import { useStage4AutoAdvance } from './hooks/useStage4AutoAdvance';
import { useStage4Settings } from './hooks/useStage4Settings';
import type { Stage4Props } from './typing';

export function Stage4Training({
    words,
    onComplete,
    isLastStage = false,
}: Stage4Props) {
    const storage = useTrainingStorage();
    const { settings, updateSettings } = useStage4SettingsHook();
    const [currentIndex, setCurrentIndex] = useState(0);
    const { open: showSettingsModal, setOpen: setShowSettingsModal } =
        useHashDialog('stage4-settings');
    const [isFirstCard, setIsFirstCard] = useState(true);
    const [exerciseResults, setExerciseResults] = useState<(boolean | null)[]>(
        [],
    );
    const [backgroundFlash, setBackgroundFlash] = useState<
        'green' | 'red' | null
    >(null);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [isRetryMode, setIsRetryMode] = useState(false);
    const [_hasCompletedFirstRound, setHasCompletedFirstRound] =
        useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [completedWordId, setCompletedWordId] = useState<string | null>(null);
    const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(
        null,
    );
    const [isCompleting, setIsCompleting] = useState(false);

    const currentWord = words[currentIndex];

    useEffect(() => {
        setExerciseResults(new Array(words.length).fill(null));
    }, [words.length]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 50);
        return () => clearTimeout(timer);
    }, [animationKey]);

    const { letters, setLetters, resetLetters } = useStage4Letters({
        currentWord,
        difficulty: settings.difficulty,
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
    } = useStage4WordBuilding({
        currentWord,
        letters,
        setLetters,
        recordAttempt: storage.recordAttempt,
    });

    const { findNextError, findNextErrorWithResults, handleNext } =
        useStage4Navigation({
            currentIndex,
            wordsLength: words.length,
            exerciseResults,
            onComplete,
        });

    const { handleSettingsChange } = useStage4Settings({
        updateSettings,
        currentSettings: settings,
        setCurrentIndex,
        setIsFirstCard,
    });

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
                // Retry mode overwrites results; normal mode only fills empty slots
                if (isRetryMode || newResults[currentIndex] === null) {
                    newResults[currentIndex] = isCorrect;
                }
                return newResults;
            });

            setBackgroundFlash(isCorrect ? 'green' : 'red');
            setShowResultPopup(true);

            if (isFirstCard) {
                setIsFirstCard(false);
            }
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
        isFirstCard,
        isRetryMode,
    ]);

    useStage4AutoAdvance({
        isComplete,
        isCorrect,
        currentIndex,
        isRetryMode,
        exerciseResults,
        baseWordsLength: words.length,
        isLastStage,
        onComplete,
        setCurrentIndex,
        setExerciseResults,
        setHasCompletedFirstRound,
        setIsRetryMode,
        setIsCompleting,
        findNextErrorWithResults,
        handleNext,
    });

    useEffect(() => {
        if (currentWord) {
            setBackgroundFlash(null);
            setShowResultPopup(false);
            setCompletedWordId(null);
            setLastCompletedIndex(null);

            // Bump key to force remount and replay the fade-in animation
            setAnimationKey(prevKey => prevKey + 1);
            setFadeIn(false);

            resetLetters();
            resetWordBuilding();
        }
    }, [
        currentIndex,
        settings.difficulty,
        currentWord,
        resetLetters,
        resetWordBuilding,
    ]);

    const handleManualNext = () => {
        if (isRetryMode) {
            const nextErrorIndex = findNextError(currentIndex);
            if (nextErrorIndex === -1 || nextErrorIndex === currentIndex) {
                // Only error left -- stay on it but reload the card
                setAnimationKey(prevKey => prevKey + 1);
                setFadeIn(false);
                resetLetters();
                resetWordBuilding();
                setBackgroundFlash(null);
                setShowResultPopup(false);
                setCompletedWordId(null);
                setLastCompletedIndex(null);
            } else {
                setCurrentIndex(nextErrorIndex);
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
                onComplete();
                setCurrentIndex(0);
                setIsRetryMode(false);
                setHasCompletedFirstRound(false);
            }
        }
    };

    const handleOpenSettings = () => {
        setShowSettingsModal(true);
    };

    const handleCloseSettings = () => {
        setShowSettingsModal(false);
    };

    if (!currentWord) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto relative">
            {isCompleting && <LoadingOverlay />}
            <Card
                key={animationKey}
                className={`shadow-xl transition-all duration-300 ease-in-out ${
                    fadeIn ? 'opacity-100' : 'opacity-0'
                } ${
                    backgroundFlash === 'green'
                        ? 'bg-green-50 border-green-400'
                        : backgroundFlash === 'red'
                          ? 'bg-red-50 border-red-400'
                          : ''
                }`}
            >
                <StageHeader
                    totalExercises={words.length}
                    completedExercises={
                        exerciseResults.filter(result => result !== null).length
                    }
                    exerciseResults={exerciseResults}
                    currentIndex={currentIndex}
                    isFirstCard={isFirstCard}
                    onOpenSettings={handleOpenSettings}
                />
                <CardContent className="space-y-6">
                    <TranslationDisplay word={currentWord} />
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
                        onLetterClick={handleLetterClick}
                    />
                    {isComplete && !isCorrect && (
                        <NextButton onNext={handleManualNext} />
                    )}
                </CardContent>
            </Card>

            <Stage4SettingsModal
                isOpen={showSettingsModal}
                onClose={handleCloseSettings}
                settings={settings}
                onChange={handleSettingsChange}
            />
        </div>
    );
}
