'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stage1SettingsModal } from '../common/Stage1SettingsModal';
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
import { LoadingOverlay } from '../common/LoadingOverlay';
import { useStage1Navigation } from './hooks/useStage1Navigation';
import { useWordInitialization } from './hooks/useWordInitialization';
import { useSettingsManagement } from './hooks/useSettingsManagement';
import type { Stage1Props } from './typing';

export function Stage1Training({
    words,
    onComplete,
    isLastStage = false,
}: Stage1Props) {
    const { settings, updateSettings } = useStage1Settings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    const currentWord = words[currentIndex];

    // Shared hooks
    const { fadeIn, animationKey, triggerAnimation } = useFadeAnimation();
    const { exerciseResults, updateResult } = useExerciseResults({
        totalExercises: words.length,
    });
    const { recordResult } = useRecordResult();
    const {
        speak,
        isPlaying,
        isSupported: speechSupported,
    } = useSpeech({
        languageCode: currentWord?.language.code || 'en',
    });

    // Stage-specific hooks
    const { handleNext } = useStage1Navigation({
        currentIndex,
        wordsLength: words.length,
        currentWordId: currentWord?.id || '',
        exerciseResults,
        isLastStage,
        updateResult,
        recordResult,
        onComplete,
        setIsCompleting,
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
        <div className="max-w-2xl mx-auto relative">
            {isCompleting && <LoadingOverlay />}
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
                <CardContent className="p-4 sm:p-6 md:p-8">
                    <div className="space-y-4 sm:space-y-6 md:space-y-8">
                        <WordDisplayWithSound
                            word={currentWord}
                            onSpeak={speak}
                            speechSupported={speechSupported}
                            isPlaying={isPlaying}
                        />

                        <div
                            className={`transition-all duration-500 ease-in-out ${
                                showTranslation
                                    ? 'opacity-100 translate-y-0'
                                    : 'opacity-0 translate-y-4 pointer-events-none'
                            }`}
                        >
                            <TranslationDisplay
                                word={currentWord}
                                showExamples={settings.showExamples}
                            />
                        </div>
                    </div>

                    <div className="pt-4 sm:pt-6">
                        {!showTranslation && (
                            <ShowTranslationButton
                                onShowTranslation={() =>
                                    setShowTranslation(true)
                                }
                                showTranslation={showTranslation}
                            />
                        )}
                        {showTranslation && (
                            <NextButton
                                onNext={handleNextClick}
                                isLastWord={currentIndex >= words.length - 1}
                            />
                        )}
                    </div>
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
