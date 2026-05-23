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
                const saved = savedState;
                const restoredWords = saved.selectedWordIds
                    .map((id: string) => allWords.find(w => w.id === id))
                    .filter(
                        (word: Word | undefined): word is Word =>
                            word !== undefined,
                    );

                if (restoredWords.length > 0) {
                    setTrainingWords(restoredWords);
                    const savedStage = saved.currentStage;
                    setCurrentStage(
                        enabledStages.includes(savedStage)
                            ? savedStage
                            : enabledStages[0],
                    );
                } else {
                    clearProgress();
                    if (filteredWords.length > 0) {
                        const shuffledWords = shuffleArray(filteredWords);
                        setTrainingWords(shuffledWords);
                        createNewSession({
                            enabledStages,
                            selectedLanguage,
                            selectedWordIds: shuffledWords.map(w => w.id),
                            stageSettings: {},
                        });
                        setCurrentStage(enabledStages[0]);
                    }
                }
            } else if (filteredWords.length > 0) {
                const shuffledWords = shuffleArray(filteredWords);
                setTrainingWords(shuffledWords);
                createNewSession({
                    enabledStages,
                    selectedLanguage,
                    selectedWordIds: shuffledWords.map(w => w.id),
                    stageSettings: {},
                });
                setCurrentStage(enabledStages[0]);
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
