'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stage5SettingsModal } from '../common/Stage5SettingsModal';
import { useStage5Settings as useStage5SettingsHook } from '@/hooks/shared/use-training-settings';
import { useTrainingStorage } from '@/hooks/training';
import { useHashDialog } from '@/hooks/shared';
import { StageHeader } from './components/StageHeader';
import { TranslationDisplay } from './components/TranslationDisplay';
import { SentenceBuilder } from './components/SentenceBuilder';
import { WordsGrid } from './components/WordsGrid';
import { NextButton } from './components/NextButton';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { useStage5Phrases } from './hooks/useStage5Phrases';
import { useStage5SentenceBuilding } from './hooks/useStage5SentenceBuilding';
import { useStage5Navigation } from './hooks/useStage5Navigation';
import { useStage5AutoAdvance } from './hooks/useStage5AutoAdvance';
import { useStage5Settings } from './hooks/useStage5Settings';
import { getExtraWords } from './helpers/getExtraWords';
import { useTranslation } from '@/lib/i18n';
import type { Stage5Props, WordState, Phrase } from './typing';

export function Stage5Training({
    words,
    onComplete,
    isLastStage = false,
}: Stage5Props) {
    const { t } = useTranslation();
    const storage = useTrainingStorage();
    const { settings, updateSettings } = useStage5SettingsHook();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
    const [availableWords, setAvailableWords] = useState<WordState[]>([]);
    const { open: showSettingsModal, setOpen: setShowSettingsModal } =
        useHashDialog('stage5-settings');
    const [isFirstCard, setIsFirstCard] = useState(true);
    const [fadeIn, setFadeIn] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [backgroundFlash, setBackgroundFlash] = useState<
        'green' | 'red' | null
    >(null);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [isRetryMode, setIsRetryMode] = useState(false);
    const [_hasCompletedFirstRound, setHasCompletedFirstRound] =
        useState(false);
    const [exerciseResults, setExerciseResults] = useState<(boolean | null)[]>(
        [],
    );
    const [completedPhraseId, setCompletedPhraseId] = useState<string | null>(
        null,
    );
    const [lastCompletedExerciseIndex, setLastCompletedExerciseIndex] =
        useState<number | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);

    const { wordsWithPhrases, wordPhrases, totalPhrases } = useStage5Phrases({
        words,
        sentencesPerWord: settings.sentencesPerWord,
    });

    const currentWord = wordsWithPhrases[currentIndex];

    useEffect(() => {
        const totalExercises = wordPhrases.reduce(
            (total, phrases) => total + phrases.length,
            0,
        );
        setExerciseResults(new Array(totalExercises).fill(null));
    }, [wordPhrases]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 50);
        return () => clearTimeout(timer);
    }, [animationKey]);

    const initializePhrase = useCallback(() => {
        if (
            wordPhrases.length <= currentIndex ||
            wordPhrases[currentIndex].length <= currentPhraseIndex
        )
            return;

        const currentWordPhrases = wordPhrases[currentIndex];
        const phrase = currentWordPhrases[currentPhraseIndex];
        setCurrentPhrase(phrase);

        const extraWords = getExtraWords(
            phrase.pronoun,
            currentWord.language.code,
            phrase.words,
            words,
        );
        const allWords = [...phrase.words, ...extraWords];

        const shuffledWords = allWords.sort(() => Math.random() - 0.5);
        const wordStates: WordState[] = shuffledWords.map(word => ({
            word,
            selected: false,
        }));
        setAvailableWords(wordStates);
    }, [wordPhrases, currentIndex, currentPhraseIndex, currentWord, words]);

    useEffect(() => {
        if (
            currentWord &&
            wordPhrases.length > currentIndex &&
            wordPhrases[currentIndex].length > 0
        ) {
            // Bump key to force remount and replay the fade-in animation
            setAnimationKey(prev => prev + 1);
            setFadeIn(false);

            initializePhrase();
            setBackgroundFlash(null);
            setShowResultPopup(false);
        }
    }, [
        currentIndex,
        currentPhraseIndex,
        wordPhrases,
        currentWord,
        initializePhrase,
    ]);

    const {
        userSentence,
        isComplete,
        isCorrect,
        flashingWord,
        handleWordClick,
        handleRemoveFromSentence,
        resetSentenceBuilding,
    } = useStage5SentenceBuilding({
        currentPhrase,
        availableWords,
        setAvailableWords,
    });

    const { getWordAndPhraseIndex, findNextError, handleNext } =
        useStage5Navigation({
            currentIndex,
            currentPhraseIndex,
            wordPhrases,
            wordsWithPhrasesLength: wordsWithPhrases.length,
            exerciseResults,
            onComplete,
        });

    const { handleSettingsChange } = useStage5Settings({
        updateSettings,
        currentSettings: settings,
        setCurrentIndex,
        setCurrentPhraseIndex,
        setIsFirstCard,
    });

    useEffect(() => {
        if (
            isComplete &&
            isCorrect !== null &&
            currentPhrase &&
            currentWord &&
            completedPhraseId === null &&
            lastCompletedExerciseIndex !==
                wordPhrases
                    .slice(0, currentIndex)
                    .reduce((total, phrases) => total + phrases.length, 0) +
                    currentPhraseIndex
        ) {
            const exerciseIndex =
                wordPhrases
                    .slice(0, currentIndex)
                    .reduce((total, phrases) => total + phrases.length, 0) +
                currentPhraseIndex;

            setCompletedPhraseId(`${currentIndex}-${currentPhraseIndex}`);
            setLastCompletedExerciseIndex(exerciseIndex);

            setBackgroundFlash(isCorrect ? 'green' : 'red');
            setShowResultPopup(true);

            setExerciseResults(prev => {
                const newResults = [...prev];
                // Retry mode overwrites results; normal mode only fills empty slots
                if (isRetryMode || newResults[exerciseIndex] === null) {
                    newResults[exerciseIndex] = isCorrect;
                }
                return newResults;
            });

            storage.recordAttempt(5, currentWord.id, isCorrect);

            fetch('/api/training', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wordId: currentWord.id,
                    stage: 5,
                    isCorrect: isCorrect,
                }),
            });

            if (isFirstCard) {
                setIsFirstCard(false);
            }
        } else if (
            currentPhrase &&
            currentWord &&
            completedPhraseId !== null &&
            completedPhraseId !== `${currentIndex}-${currentPhraseIndex}`
        ) {
            setShowResultPopup(false);
            setBackgroundFlash(null);
        }
    }, [
        isComplete,
        isCorrect,
        currentPhrase,
        currentWord,
        currentIndex,
        currentPhraseIndex,
        wordPhrases,
        isFirstCard,
        storage,
        completedPhraseId,
        lastCompletedExerciseIndex,
        isRetryMode,
    ]);

    useStage5AutoAdvance({
        isComplete,
        isCorrect,
        currentIndex,
        currentPhraseIndex,
        isRetryMode,
        exerciseResults,
        wordPhrases,
        wordsWithPhrasesLength: wordsWithPhrases.length,
        isLastStage,
        onComplete,
        setCurrentIndex,
        setCurrentPhraseIndex,
        setExerciseResults,
        setHasCompletedFirstRound,
        setIsRetryMode,
        setIsCompleting,
    });

    useEffect(() => {
        if (currentPhrase) {
            resetSentenceBuilding();
            setBackgroundFlash(null);
            setShowResultPopup(false);
            setCompletedPhraseId(null);
            // Intentionally NOT resetting lastCompletedExerciseIndex so a stale
            // result is not re-applied to a freshly opened phrase.
        }
    }, [
        currentIndex,
        currentPhraseIndex,
        currentPhrase,
        resetSentenceBuilding,
    ]);

    const handleWordClickWrapper = useCallback(
        (index: number) => {
            handleWordClick(index);
        },
        [handleWordClick],
    );

    const handleManualNext = () => {
        if (isRetryMode) {
            const currentExerciseIndex =
                wordPhrases
                    .slice(0, currentIndex)
                    .reduce((total, phrases) => total + phrases.length, 0) +
                currentPhraseIndex;
            const nextErrorIndex = findNextError(currentExerciseIndex);

            if (
                nextErrorIndex === -1 ||
                nextErrorIndex === currentExerciseIndex
            ) {
                // Only error left -- stay on it but reload the card
                setAnimationKey(prev => prev + 1);
                setFadeIn(false);
                initializePhrase();
                resetSentenceBuilding();
                setBackgroundFlash(null);
                setShowResultPopup(false);
            } else {
                const nextErrorPosition = getWordAndPhraseIndex(nextErrorIndex);
                if (nextErrorPosition) {
                    setCurrentIndex(nextErrorPosition.wordIndex);
                    setCurrentPhraseIndex(nextErrorPosition.phraseIndex);
                }
            }
        } else {
            const result = handleNext();
            if (result.type === 'nextPhrase') {
                setCurrentPhraseIndex(result.phraseIndex);
            } else if (result.type === 'nextWord') {
                setCurrentIndex(result.wordIndex);
                setCurrentPhraseIndex(result.phraseIndex);
            } else if (result.type === 'retry') {
                setIsRetryMode(true);
                setHasCompletedFirstRound(true);
                setCurrentIndex(result.wordIndex);
                setCurrentPhraseIndex(result.phraseIndex);
            } else if (result.type === 'complete') {
                onComplete();
                setCurrentIndex(0);
                setCurrentPhraseIndex(0);
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

    if (!currentWord || !currentPhrase) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-gray-600">
                        {wordsWithPhrases.length === 0
                            ? t(
                                  'No words with examples for training at this stage',
                              )
                            : t('Loading...')}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto relative">
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
                    totalPhrases={totalPhrases}
                    completedExercises={
                        exerciseResults.filter(result => result !== null).length
                    }
                    exerciseResults={exerciseResults}
                    currentIndex={currentIndex}
                    currentPhraseIndex={currentPhraseIndex}
                    wordPhrases={wordPhrases}
                    isFirstCard={isFirstCard}
                    onOpenSettings={handleOpenSettings}
                />
                <CardContent className="space-y-6">
                    <TranslationDisplay phrase={currentPhrase} />
                    <SentenceBuilder
                        userSentence={userSentence}
                        isComplete={isComplete}
                        showResultPopup={showResultPopup}
                        isCorrect={isCorrect}
                        onRemoveWord={handleRemoveFromSentence}
                    />
                    <WordsGrid
                        words={availableWords}
                        flashingWord={flashingWord}
                        isComplete={isComplete}
                        onWordClick={handleWordClickWrapper}
                    />
                    {isComplete && !isCorrect && (
                        <NextButton onNext={handleManualNext} />
                    )}
                </CardContent>
            </Card>

            <Stage5SettingsModal
                isOpen={showSettingsModal}
                onClose={handleCloseSettings}
                settings={settings}
                onChange={handleSettingsChange}
            />
        </div>
    );
}
