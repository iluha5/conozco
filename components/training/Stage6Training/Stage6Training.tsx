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
import { useStage6Letters } from './hooks/useStage6Letters';
import { useStage6WordBuilding } from './hooks/useStage6WordBuilding';
import { useStage6Navigation } from './hooks/useStage6Navigation';
import { useStage6AutoAdvance } from './hooks/useStage6AutoAdvance';
import type { Stage6Props } from './typing';

export function Stage6Training({ words, onComplete }: Stage6Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [backgroundFlash, setBackgroundFlash] = useState<
        'green' | 'red' | null
    >(null);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [completedWordId, setCompletedWordId] = useState<string | null>(null);
    const [lastCompletedIndex, setLastCompletedIndex] = useState<number | null>(
        null,
    );

    // Filter only base words (exclude custom words)
    const baseWords = words.filter(word => word.baseWordId && !word.customWord);
    const currentWord = baseWords[currentIndex];

    // Используем новые хуки
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
    } = useRetryMode({
        totalExercises: baseWords.length,
    });
    const {
        speak,
        isPlaying,
        isSupported: speechSupported,
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

    // Функция для поиска следующей ошибки (использует текущее состояние)
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

    // Инициализируем буквы при смене слова
    useEffect(() => {
        if (currentWord) {
            // Сбрасываем попап и фон сразу при переходе к новому слову
            setBackgroundFlash(null);
            setShowResultPopup(false);
            setCompletedWordId(null);
            setLastCompletedIndex(null);

            triggerAnimation();
            resetLetters();
            resetWordBuilding();

            // Автоматически проговариваем слово при открытии карточки
            if (speechSupported) {
                const timer = setTimeout(() => {
                    speak(currentWordText);
                }, 500); // Небольшая задержка для плавности появления карточки
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
        currentWordText,
    ]);

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
                // В режиме retry всегда обновляем результат, даже если он уже был установлен
                // В обычном режиме устанавливаем результат только если для этого индекса еще нет результата
                if (isRetryMode || newResults[currentIndex] === null) {
                    newResults[currentIndex] = isCorrect;
                }
                return newResults;
            });

            // Устанавливаем цвет фона и показываем попап с результатом
            setBackgroundFlash(isCorrect ? 'green' : 'red');
            setShowResultPopup(true);

            // Обновляем результаты упражнения
            updateResult(currentIndex, isCorrect);

            // Записываем результат (API + localStorage)
            recordResult(6, currentWord.id, isCorrect);
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
        onComplete,
        setCurrentIndex,
        setExerciseResults,
        setIsRetryMode,
        setHasCompletedFirstRound,
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
    });

    const handleLetterClickWrapper = useCallback(
        (index: number) => {
            handleLetterClick(index);
        },
        [handleLetterClick],
    );

    const handlePlayWord = useCallback(() => {
        speak(currentWordText);
    }, [speak, currentWordText]);

    if (!currentWord) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-gray-600">
                        Нет основных слов для тренировки. Добавьте слова из
                        словаря!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
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
