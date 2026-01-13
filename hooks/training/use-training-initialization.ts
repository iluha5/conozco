import { useEffect, useState } from 'react';
import { Word, TrainingStage } from '@/types/training.types';
import { shuffleArray } from '@/lib/training-utils';

interface UseTrainingInitializationProps {
    settingsLoaded: boolean;
    selectionLoaded: boolean;
    allWords: Word[];
    filteredWords: Word[];
    enabledStages: TrainingStage[];
    selectedLanguage: string;
    hasUnfinishedTraining: boolean;
    savedState: any;
    setTrainingWords: (_words: Word[]) => void;
    setCurrentStage: (_stage: TrainingStage) => void;
    clearProgress: () => void;
    createNewSession: (_config: {
        enabledStages: TrainingStage[];
        selectedLanguage: string;
        selectedWordIds: string[];
        stageSettings: { [key: string]: any };
    }) => any;
}

/**
 * Хук для инициализации или восстановления тренировки
 */
export function useTrainingInitialization({
    settingsLoaded,
    selectionLoaded,
    allWords,
    filteredWords,
    enabledStages,
    selectedLanguage,
    hasUnfinishedTraining,
    savedState,
    setTrainingWords,
    setCurrentStage,
    clearProgress,
    createNewSession,
}: UseTrainingInitializationProps) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (
            !isInitialized &&
            settingsLoaded &&
            selectionLoaded &&
            allWords.length > 0 &&
            enabledStages.length > 0
        ) {
            if (hasUnfinishedTraining && savedState) {
                // Restore saved training
                const saved = savedState;

                // Restore original words by saved IDs maintaining order
                const restoredWords = saved.selectedWordIds
                    .map((id: string) => allWords.find(w => w.id === id))
                    .filter(
                        (word: Word | undefined): word is Word =>
                            word !== undefined,
                    );

                if (restoredWords.length > 0) {
                    setTrainingWords(restoredWords);
                    // Check if saved stage is enabled
                    const savedStage = saved.currentStage;
                    const isStageEnabled = enabledStages.includes(savedStage);
                    if (isStageEnabled) {
                        setCurrentStage(savedStage);
                    } else {
                        // If saved stage is disabled, switch to first enabled
                        setCurrentStage(enabledStages[0]);
                    }
                    console.log(
                        'Restored training session:',
                        saved.sessionId,
                        `(${restoredWords.length} words)`,
                    );
                } else {
                    // If words not found, clear save and create new session
                    console.warn('Saved words not found, creating new session');
                    clearProgress();
                    if (filteredWords.length > 0) {
                        // Shuffle words before creating new session
                        const shuffledWords = shuffleArray(filteredWords);
                        setTrainingWords(shuffledWords);
                        const newSession = createNewSession({
                            enabledStages,
                            selectedLanguage,
                            selectedWordIds: shuffledWords.map(w => w.id),
                            stageSettings: {},
                        });
                        // Set first enabled stage
                        setCurrentStage(enabledStages[0]);
                        console.log(
                            'Created new training session:',
                            newSession.sessionId,
                        );
                    }
                }
            } else {
                // Create new session
                if (filteredWords.length > 0) {
                    // Shuffle words before creating new session
                    const shuffledWords = shuffleArray(filteredWords);
                    setTrainingWords(shuffledWords);
                    const newSession = createNewSession({
                        enabledStages,
                        selectedLanguage,
                        selectedWordIds: shuffledWords.map(w => w.id),
                        stageSettings: {},
                    });
                    // Set first enabled stage
                    setCurrentStage(enabledStages[0]);
                    console.log(
                        'Created new training session:',
                        newSession.sessionId,
                    );
                }
            }
            setIsInitialized(true);
        }
    }, [
        isInitialized,
        settingsLoaded,
        selectionLoaded,
        allWords,
        filteredWords,
        enabledStages,
        selectedLanguage,
        hasUnfinishedTraining,
        savedState,
        setTrainingWords,
        setCurrentStage,
        clearProgress,
        createNewSession,
    ]);

    return { isInitialized };
}
