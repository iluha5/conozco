'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stage1SettingsModal } from '../Stage1SettingsModal';
import { useStage1Settings } from '@/hooks/shared/use-training-settings';
import {
    useFadeAnimation,
    useRecordResult,
    useExerciseResults,
    useSpeech,
} from '@/hooks/training';
import { StageHeader } from './components/StageHeader';
import { WordDisplayWithSound } from './components/WordDisplayWithSound';
import { TranslationDisplay } from './components/TranslationDisplay';
import { ShowTranslationButton } from './components/ShowTranslationButton';
import { NextButton } from './components/NextButton';
import { useStage1Navigation } from './hooks/useStage1Navigation';
import { useWordInitialization } from './hooks/useWordInitialization';
import { useSettingsManagement } from './hooks/useSettingsManagement';
import type { Stage1Props } from './typing';

export function Stage1Training({ words, onComplete }: Stage1Props) {
    const { settings, updateSettings } = useStage1Settings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const currentWord = words[currentIndex];

    // Shared hooks
    const { fadeIn, animationKey, triggerAnimation } = useFadeAnimation();
    const { exerciseResults, updateResult } = useExerciseResults({
        totalExercises: words.length,
    });
    const { recordResult } = useRecordResult();
    const { speak, isSupported: speechSupported } = useSpeech({
        languageCode: currentWord?.language.code || 'en',
    });

    // Stage-specific hooks
    const { handleNext } = useStage1Navigation({
        currentIndex,
        wordsLength: words.length,
        currentWordId: currentWord?.id || '',
        updateResult,
        recordResult,
        onComplete,
    });

    useWordInitialization({
        currentWord,
        currentIndex,
        triggerAnimation,
        setShowTranslation,
        speak,
        speechSupported,
    });

    const { handleSettingsChange } = useSettingsManagement({
        updateSettings,
        setShowSettingsModal,
    });

    const handleNextClick = async () => {
        const result = await handleNext();
        if (result.type === 'next') {
            setCurrentIndex(result.nextIndex);
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
                }`}
            >
                <StageHeader
                    totalExercises={words.length}
                    completedExercises={currentIndex}
                    exerciseResults={exerciseResults}
                    currentIndex={currentIndex}
                    onOpenSettings={handleOpenSettings}
                />
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <WordDisplayWithSound
                            word={currentWord}
                            onSpeak={speak}
                            speechSupported={speechSupported}
                        />

                        <div className="relative mt-4 flex items-center justify-center">
                            <div
                                className={`inset-0 flex items-center justify-center transition-opacity duration-300 ${
                                    showTranslation
                                        ? 'opacity-100'
                                        : 'opacity-0 pointer-events-none'
                                }`}
                            >
                                <TranslationDisplay
                                    word={currentWord}
                                    showExamples={settings.showExamples}
                                />
                            </div>
                        </div>
                    </div>

                    {!showTranslation && (
                        <ShowTranslationButton
                            onShowTranslation={() => setShowTranslation(true)}
                            showTranslation={showTranslation}
                        />
                    )}
                    {showTranslation && (
                        <NextButton
                            onNext={handleNextClick}
                            isLastWord={currentIndex >= words.length - 1}
                        />
                    )}
                </CardContent>
            </Card>

            <Stage1SettingsModal
                isOpen={showSettingsModal}
                onClose={handleCloseSettings}
                settings={settings}
                onChange={handleSettingsChange}
            />
        </div>
    );
}
