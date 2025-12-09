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
                // Восстанавливаем сохраненную тренировку
                const saved = savedState;

                // Восстанавливаем исходные слова по сохраненным ID с сохранением порядка
                const restoredWords = saved.selectedWordIds
                    .map((id: string) => allWords.find(w => w.id === id))
                    .filter(
                        (word: Word | undefined): word is Word =>
                            word !== undefined,
                    );

                if (restoredWords.length > 0) {
                    setTrainingWords(restoredWords);
                    // Проверяем, включен ли сохраненный этап
                    const savedStage = saved.currentStage;
                    const isStageEnabled = enabledStages.includes(savedStage);
                    if (isStageEnabled) {
                        setCurrentStage(savedStage);
                    } else {
                        // Если сохраненный этап отключен, переключаемся на первый включенный
                        setCurrentStage(enabledStages[0]);
                    }
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
                        // Перемешиваем слова перед созданием новой сессии
                        const shuffledWords = shuffleArray(filteredWords);
                        setTrainingWords(shuffledWords);
                        const newSession = createNewSession({
                            enabledStages,
                            selectedLanguage,
                            selectedWordIds: shuffledWords.map(w => w.id),
                            stageSettings: {},
                        });
                        // Устанавливаем первый включенный этап
                        setCurrentStage(enabledStages[0]);
                        console.log(
                            'Created new training session:',
                            newSession.sessionId,
                        );
                    }
                }
            } else {
                // Создаем новую сессию
                if (filteredWords.length > 0) {
                    // Перемешиваем слова перед созданием новой сессии
                    const shuffledWords = shuffleArray(filteredWords);
                    setTrainingWords(shuffledWords);
                    const newSession = createNewSession({
                        enabledStages,
                        selectedLanguage,
                        selectedWordIds: shuffledWords.map(w => w.id),
                        stageSettings: {},
                    });
                    // Устанавливаем первый включенный этап
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
