import { useState, useEffect, useCallback } from 'react';
import {
    SavedTrainingState,
    StageProgress,
    TrainingStage,
    WordProgress,
} from '@/types/training.types';
import { STORAGE_KEYS } from '@/config/storage-keys';

const STORAGE_KEY = STORAGE_KEYS.TRAINING_PROGRESS;

/**
 * Хук для работы с сохранением прогресса тренировки в localStorage
 */
export function useTrainingStorage() {
    const [savedState, setSavedState] = useState<SavedTrainingState | null>(
        null,
    );

    // Загрузка сохраненного состояния при монтировании
    useEffect(() => {
        const loadSavedState = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved) as SavedTrainingState;
                    setSavedState(parsed);
                }
            } catch (error) {
                console.error('Error loading saved training state:', error);
            }
        };

        loadSavedState();
    }, []);

    /**
     * Сохранить состояние тренировки
     */
    const saveProgress = useCallback((state: SavedTrainingState) => {
        try {
            const stateToSave = {
                ...state,
                lastUpdatedAt: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
            setSavedState(stateToSave);
        } catch (error) {
            console.error('Error saving training state:', error);
        }
    }, []);

    /**
     * Очистить сохраненное состояние
     */
    const clearProgress = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setSavedState(null);
        } catch (error) {
            console.error('Error clearing training state:', error);
        }
    }, []);

    /**
     * Проверить, есть ли незавершенная тренировка
     */
    const hasUnfinishedTraining = useCallback(() => {
        return savedState !== null;
    }, [savedState]);

    /**
     * Создать новую сессию тренировки
     */
    const createNewSession = useCallback(
        (params: {
            enabledStages: TrainingStage[];
            selectedLanguage: string;
            selectedWordIds: string[];
            stageSettings?: SavedTrainingState['stageSettings'];
        }): SavedTrainingState => {
            const sessionId = `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();

            // Инициализируем прогресс для каждого этапа
            const stagesProgress: StageProgress[] = params.enabledStages.map(
                stage => ({
                    stage,
                    status: 'pending' as const,
                    wordsProgress: params.selectedWordIds.map(wordId => ({
                        wordId,
                        isCompleted: false,
                        attempts: 0,
                        correctAttempts: 0,
                    })),
                    currentWordIndex: 0,
                }),
            );

            const newState: SavedTrainingState = {
                sessionId,
                startedAt: now,
                lastUpdatedAt: now,
                enabledStages: params.enabledStages,
                stageSettings: params.stageSettings || {},
                selectedLanguage: params.selectedLanguage,
                selectedWordIds: params.selectedWordIds,
                currentStage: params.enabledStages[0],
                stagesProgress,
                totalWords: params.selectedWordIds.length,
                completedWords: 0,
            };

            saveProgress(newState);
            return newState;
        },
        [saveProgress],
    );

    /**
     * Обновить прогресс по текущему слову
     */
    const updateWordProgress = useCallback(
        (
            stage: TrainingStage,
            wordId: string,
            progress: Partial<WordProgress>,
        ) => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (!saved) return;

                const currentState = JSON.parse(saved) as SavedTrainingState;
                const updatedStagesProgress = currentState.stagesProgress.map(
                    sp => {
                        if (sp.stage !== stage) return sp;

                        const updatedWordsProgress = sp.wordsProgress.map(
                            wp => {
                                if (wp.wordId !== wordId) return wp;
                                return {
                                    ...wp,
                                    ...progress,
                                    lastAttemptAt: new Date().toISOString(),
                                };
                            },
                        );

                        return {
                            ...sp,
                            wordsProgress: updatedWordsProgress,
                        };
                    },
                );

                // Подсчитываем завершенные слова
                const completedWords = updatedStagesProgress.reduce(
                    (count, sp) => {
                        if (sp.status === 'completed') {
                            return (
                                count +
                                sp.wordsProgress.filter(wp => wp.isCompleted)
                                    .length
                            );
                        }
                        return count;
                    },
                    0,
                );

                const updatedState = {
                    ...currentState,
                    stagesProgress: updatedStagesProgress,
                    completedWords,
                    lastUpdatedAt: new Date().toISOString(),
                };

                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
                setSavedState(updatedState);
            } catch (error) {
                console.error('Error updating word progress:', error);
            }
        },
        [],
    );

    /**
     * Отметить этап как завершенный
     */
    const completeStage = useCallback((stage: TrainingStage) => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;

            const currentState = JSON.parse(saved) as SavedTrainingState;
            const updatedStagesProgress = currentState.stagesProgress.map(
                sp => {
                    if (sp.stage !== stage) return sp;
                    return {
                        ...sp,
                        status: 'completed' as const,
                        completedAt: new Date().toISOString(),
                    };
                },
            );

            const updatedState = {
                ...currentState,
                stagesProgress: updatedStagesProgress,
                lastUpdatedAt: new Date().toISOString(),
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
            setSavedState(updatedState);
        } catch (error) {
            console.error('Error completing stage:', error);
        }
    }, []);

    /**
     * Переключить текущий этап
     */
    const setCurrentStage = useCallback((stage: TrainingStage) => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;

            const currentState = JSON.parse(saved) as SavedTrainingState;
            // Обновляем статус этапов
            const updatedStagesProgress = currentState.stagesProgress.map(
                sp => {
                    if (sp.stage === stage && sp.status === 'pending') {
                        return { ...sp, status: 'in_progress' as const };
                    }
                    return sp;
                },
            );

            const updatedState = {
                ...currentState,
                currentStage: stage,
                stagesProgress: updatedStagesProgress,
                lastUpdatedAt: new Date().toISOString(),
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
            setSavedState(updatedState);
        } catch (error) {
            console.error('Error setting current stage:', error);
        }
    }, []);

    /**
     * Записать попытку для слова (вызывается при ответе пользователя)
     */
    const recordAttempt = useCallback(
        (stage: TrainingStage, wordId: string, isCorrect: boolean) => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (!saved) return;

                const currentState = JSON.parse(saved) as SavedTrainingState;
                const updatedStagesProgress = currentState.stagesProgress.map(
                    sp => {
                        if (sp.stage !== stage) return sp;

                        const updatedWordsProgress = sp.wordsProgress.map(
                            wp => {
                                if (wp.wordId !== wordId) return wp;
                                return {
                                    ...wp,
                                    attempts: wp.attempts + 1,
                                    correctAttempts: isCorrect
                                        ? wp.correctAttempts + 1
                                        : wp.correctAttempts,
                                    isCompleted: isCorrect
                                        ? true
                                        : wp.isCompleted, // Отмечаем как завершенное при правильном ответе
                                    lastAttemptAt: new Date().toISOString(),
                                };
                            },
                        );

                        return {
                            ...sp,
                            wordsProgress: updatedWordsProgress,
                        };
                    },
                );

                // Подсчитываем уникальные завершенные слова по всем этапам
                const completedWordIds = new Set<string>();
                updatedStagesProgress.forEach(sp => {
                    sp.wordsProgress.forEach(wp => {
                        if (wp.isCompleted) {
                            completedWordIds.add(wp.wordId);
                        }
                    });
                });

                const updatedState = {
                    ...currentState,
                    stagesProgress: updatedStagesProgress,
                    completedWords: completedWordIds.size,
                    lastUpdatedAt: new Date().toISOString(),
                };

                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
                setSavedState(updatedState);
            } catch (error) {
                console.error('Error recording attempt:', error);
            }
        },
        [],
    );

    /**
     * Получить прогресс по этапу
     */
    const getStageProgress = useCallback(
        (stage: TrainingStage): StageProgress | undefined => {
            return savedState?.stagesProgress.find(sp => sp.stage === stage);
        },
        [savedState],
    );

    return {
        savedState,
        hasUnfinishedTraining: hasUnfinishedTraining(),
        saveProgress,
        clearProgress,
        createNewSession,
        updateWordProgress,
        recordAttempt,
        completeStage,
        setCurrentStage,
        getStageProgress,
    };
}
