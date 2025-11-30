'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stage4SettingsModal } from '../Stage4SettingsModal';
import { useStage4Settings as useStage4SettingsHook } from '@/hooks/shared/use-training-settings';
import { useTrainingStorage } from '@/hooks/training';
import { StageHeader } from './components/StageHeader';
import { TranslationDisplay } from './components/TranslationDisplay';
import { WordBuilder } from './components/WordBuilder';
import { LettersGrid } from './components/LettersGrid';
import { NextButton } from './components/NextButton';
import { useStage4Letters } from './hooks/useStage4Letters';
import { useStage4WordBuilding } from './hooks/useStage4WordBuilding';
import { useStage4Navigation } from './hooks/useStage4Navigation';
import { useStage4AutoAdvance } from './hooks/useStage4AutoAdvance';
import { useStage4Settings } from './hooks/useStage4Settings';
import type { Stage4Props } from './typing';

export function Stage4Training({ words, onComplete }: Stage4Props) {
    const storage = useTrainingStorage();
    const { settings, updateSettings } = useStage4SettingsHook();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
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

    const currentWord = words[currentIndex];

    // Инициализируем массив результатов упражнений
    useEffect(() => {
        setExerciseResults(new Array(words.length).fill(null));
    }, [words.length]);

    // Запускаем анимацию при каждом монтировании компонента (при новом слове)
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
        setShowSettingsModal,
        setCurrentIndex,
        setIsFirstCard,
    });

    // Обновляем результаты упражнения при завершении слова
    useEffect(() => {
        if (
            isComplete &&
            isCorrect !== null &&
            currentWord &&
            completedWordId === null &&
            lastCompletedIndex !== currentIndex
        ) {
            // Устанавливаем ID завершенного слова только если он еще не установлен
            setCompletedWordId(currentWord.id);
            setLastCompletedIndex(currentIndex);

            setExerciseResults(prevResults => {
                const newResults = [...prevResults];
                // Устанавливаем результат только если для этого индекса еще нет результата
                if (newResults[currentIndex] === null) {
                    newResults[currentIndex] = isCorrect;
                }
                return newResults;
            });

            // Устанавливаем цвет фона и показываем попап с результатом
            setBackgroundFlash(isCorrect ? 'green' : 'red');
            setShowResultPopup(true);

            // После первого ответа скрываем кнопку настроек
            if (isFirstCard) {
                setIsFirstCard(false);
            }
        } else if (
            currentWord &&
            completedWordId !== null &&
            currentWord.id !== completedWordId
        ) {
            // Если перешли к новому слову, скрываем попап
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
    ]);

    useStage4AutoAdvance({
        isComplete,
        isCorrect,
        currentIndex,
        isRetryMode,
        exerciseResults,
        onComplete,
        setCurrentIndex,
        setExerciseResults,
        setHasCompletedFirstRound,
        setIsRetryMode,
        findNextErrorWithResults,
        handleNext,
    });

    // Сброс состояния при изменении слова
    useEffect(() => {
        if (currentWord) {
            // Сбрасываем попап и фон сразу при переходе к новому слову
            setBackgroundFlash(null);
            setShowResultPopup(false);
            setCompletedWordId(null);
            setLastCompletedIndex(null);

            // Генерируем новый ключ для принудительного перемонтирования компонента
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
            // В режиме исправления ошибок при неправильном ответе
            const nextErrorIndex = findNextError(currentIndex);
            if (nextErrorIndex === -1 || nextErrorIndex === currentIndex) {
                // Это единственная ошибка или других нет - остаемся на ней, но перезагружаем карточку
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
            // Обычный режим - переходим к следующему
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
        <div className="max-w-2xl mx-auto">
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
