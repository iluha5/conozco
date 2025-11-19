import { useEffect, useState } from 'react';
import { Word, TrainingStage } from '@/types/training.types';

interface UseTrainingInitializationProps {
    settingsLoaded: boolean;
    selectionLoaded: boolean;
    allWords: Word[];
    filteredWords: Word[];
    enabledStages: TrainingStage[];
    selectedLanguage: string;
    hasUnfinishedTraining: boolean;
    savedState: any;
    setTrainingWords: (words: Word[]) => void;
    setCurrentStage: (stage: TrainingStage) => void;
    clearProgress: () => void;
    createNewSession: (config: {
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
                // Восстанавливаем сохраненную тренировку
                const saved = savedState;

                // Восстанавливаем исходные слова по сохраненным ID
                const restoredWords = allWords.filter(w =>
                    saved.selectedWordIds.includes(w.id),
                );

                if (restoredWords.length > 0) {
                    setTrainingWords(restoredWords);
                    setCurrentStage(saved.currentStage);
                    console.log(
                        'Restored training session:',
                        saved.sessionId,
                        `(${restoredWords.length} words)`,
                    );
                } else {
                    // Если слова не найдены, очищаем сохранение и создаем новую сессию
                    console.warn('Saved words not found, creating new session');
                    clearProgress();
                    if (filteredWords.length > 0) {
                        setTrainingWords(filteredWords);
                        const newSession = createNewSession({
                            enabledStages,
                            selectedLanguage,
                            selectedWordIds: filteredWords.map(w => w.id),
                            stageSettings: {},
                        });
                        console.log(
                            'Created new training session:',
                            newSession.sessionId,
                        );
                    }
                }
            } else {
                // Создаем новую сессию
                if (filteredWords.length > 0) {
                    setTrainingWords(filteredWords);
                    const newSession = createNewSession({
                        enabledStages,
                        selectedLanguage,
                        selectedWordIds: filteredWords.map(w => w.id),
                        stageSettings: {},
                    });
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
