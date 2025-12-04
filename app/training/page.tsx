'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { TrainingHeader } from '@/components/training/common/TrainingHeader';
import { ExitConfirmationDialog } from '@/components/training/common/ExitConfirmationDialog';
import { StageSelector } from '@/components/training/common/StageSelector';
import { StageRenderer } from '@/components/training/common/StageRenderer';
import { TrainingEmptyState } from '@/components/training/common/TrainingEmptyState';
import { TrainingResults } from '@/components/training/common/TrainingResults';
import { TrainingLoading } from '@/components/training/common/TrainingLoading';
import {
    useTrainingState,
    useTrainingLogic,
    useTrainingWordsFilter,
    useTrainingData,
    useTrainingStorage,
    useTrainingInitialization,
    useTrainingStorageCheck,
} from '@/hooks/training';
import {
    useTrainingSettings,
    useTrainingSelection,
    useHashDialog,
} from '@/hooks/shared';
import { useTrainingWords } from '@/contexts/training-words-context';
import { trainingApi } from '@/lib/api/training.api';
import { TrainingStage } from '@/types/training.types';
import { Card, CardContent } from '@/components/ui/card';
import { STORAGE_KEYS } from '@/config/storage-keys';

const STORAGE_KEY = STORAGE_KEYS.TRAINING_PROGRESS;

export default function TrainingPage() {
    const router = useRouter();
    const { open: isExitDialogOpen, setOpen: setIsExitDialogOpen } =
        useHashDialog('exit-training-confirm');

    const { settings: trainingSettings, isLoaded: settingsLoaded } =
        useTrainingSettings();
    const { selectedLanguage, isLoaded: selectionLoaded } =
        useTrainingSelection();
    const { selectedWords } = useTrainingWords();

    const state = useTrainingState();
    const { handleStageComplete } = useTrainingLogic();
    const storage = useTrainingStorage();

    // Проверка наличия незавершённой тренировки и редирект
    const { isStorageChecked, shouldRedirect } = useTrainingStorageCheck({
        selectedWordsCount: selectedWords.size,
    });

    // Загрузка данных - только после проверки localStorage
    useTrainingData(
        isStorageChecked && !shouldRedirect && settingsLoaded,
        isStorageChecked && !shouldRedirect && selectionLoaded,
        state.setWords,
        state.setIsLoading,
    );

    // Фильтрация слов для тренировки
    const filteredWords = useTrainingWordsFilter(
        state.words,
        selectedLanguage,
        selectedWords,
    );

    // Включенные этапы
    const enabledStages = useMemo(
        () =>
            trainingSettings
                ? (Array.from(
                      trainingSettings.enabledStages,
                  ).sort() as TrainingStage[])
                : ([1, 2, 3, 4, 5, 6] as TrainingStage[]),
        [trainingSettings],
    );

    // Инициализация или восстановление тренировки - только после проверки localStorage
    useTrainingInitialization({
        settingsLoaded: isStorageChecked && !shouldRedirect && settingsLoaded,
        selectionLoaded: isStorageChecked && !shouldRedirect && selectionLoaded,
        allWords: state.words,
        filteredWords,
        enabledStages,
        selectedLanguage,
        hasUnfinishedTraining: storage.hasUnfinishedTraining,
        savedState: storage.savedState,
        setTrainingWords: state.setTrainingWords,
        setCurrentStage: state.setCurrentStage,
        clearProgress: storage.clearProgress,
        createNewSession: storage.createNewSession,
    });

    // Валидация текущего этапа - если он отключен, переключаемся на первый включенный
    useEffect(() => {
        if (
            enabledStages.length > 0 &&
            !enabledStages.includes(state.currentStage)
        ) {
            state.setCurrentStage(enabledStages[0]);
            storage.setCurrentStage(enabledStages[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabledStages, state.currentStage, state.setCurrentStage, storage]);

    // Убрали автоматическую синхронизацию - сохраняем только при действиях пользователя

    // Обработчики
    const handleExit = () => setIsExitDialogOpen(true);

    const handlePause = () => {
        // Прогресс уже сохранен в localStorage, просто переходим на главную
        router.push('/');
    };

    const handleConfirmExit = () => {
        // Очищаем сохраненное состояние при выходе
        storage.clearProgress();
        // Не вызываем setIsExitDialogOpen(false) - это вызовет history.back()
        // и создаст конфликт с router.push. Диалог закроется при переходе.
        router.push('/');
    };

    const handleStageCompleteWrapper = async () => {
        try {
            const result = await handleStageComplete(
                state.currentStage,
                new Set(enabledStages),
                state.trainingWords,
                storage.savedState?.stagesProgress || [],
            );

            // Всегда отмечаем текущий этап как завершенный
            storage.completeStage(state.currentStage);

            if (result.completed && result.learnedWords) {
                // Тренировка завершена успешно
                state.setIsCompleted(true);
                state.setCompletedWords(result.learnedWords);

                // Читаем актуальное состояние из localStorage для сохранения лога
                const savedProgress = localStorage.getItem(STORAGE_KEY);
                if (savedProgress) {
                    try {
                        const currentState = JSON.parse(savedProgress);
                        await trainingApi.saveTrainingLog(currentState);
                    } catch (error) {
                        console.error('Failed to save training log:', error);
                    }
                }

                // Очищаем localStorage после успешного завершения
                storage.clearProgress();
            } else if (result.nextStage) {
                // Переходим к следующему этапу (последовательное прохождение)
                storage.setCurrentStage(result.nextStage);
                state.setCurrentStage(result.nextStage);
            } else {
                // Этап завершен, но тренировка не завершена
                // Используем небольшую задержку чтобы дать время обновиться localStorage
                setTimeout(() => {
                    const savedProgress = localStorage.getItem(STORAGE_KEY);

                    if (savedProgress) {
                        const currentState = JSON.parse(savedProgress);
                        const currentProgress =
                            currentState.stagesProgress || [];

                        // Находим первый незавершенный этап и переключаемся на него
                        const firstIncompleteStage = enabledStages.find(
                            stage => {
                                const progress = currentProgress.find(
                                    (sp: {
                                        stage: TrainingStage;
                                        status: string;
                                    }) => sp.stage === stage,
                                );
                                return progress?.status !== 'completed';
                            },
                        );

                        if (firstIncompleteStage) {
                            storage.setCurrentStage(firstIncompleteStage);
                            state.setCurrentStage(firstIncompleteStage);
                        }
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error completing stage:', error);
        }
    };

    const handleReloadWords = async () => {
        try {
            const allWords = await trainingApi.fetchWords();
            const trainedWordIds = state.trainingWords.map(w => w.id);
            const learnedWords = allWords.filter(w =>
                trainedWordIds.includes(w.id),
            );
            state.setCompletedWords(learnedWords);
        } catch (error) {
            console.error('Error reloading words:', error);
        }
    };

    const handleStartNewTraining = () => {
        state.resetTraining();
        storage.clearProgress();
        router.push('/training/setup');
    };

    // Обработчик ручного переключения этапов
    const handleStageSelect = (stage: TrainingStage) => {
        state.setCurrentStage(stage);
        // Сохраняем при ручном переключении пользователем
        storage.setCurrentStage(stage);
    };

    // Проверка, включен ли текущий этап
    const isStageEnabled = enabledStages.includes(state.currentStage);

    // Получаем статусы этапов для подсветки
    const getStageStatus = (
        stage: TrainingStage,
    ): 'completed' | 'current' | 'pending' => {
        if (!storage.savedState) return 'pending';

        const stageProgress = storage.getStageProgress(stage);
        if (!stageProgress) return 'pending';

        if (stageProgress.status === 'completed') return 'completed';
        if (stage === state.currentStage) return 'current';
        return 'pending';
    };

    // Показываем лоадер пока проверяется localStorage или выполняется редирект
    if (!isStorageChecked || shouldRedirect) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <TrainingLoading />
                </div>
            </div>
        );
    }

    // Рендер экрана результатов
    if (state.isCompleted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <TrainingResults
                        completedWords={state.completedWords}
                        onReload={handleReloadWords}
                        onStartNew={handleStartNewTraining}
                    />
                </div>
            </div>
        );
    }

    // Рендер основного экрана тренировки
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <TrainingHeader onExit={handleExit} onPause={handlePause} />

                <ExitConfirmationDialog
                    open={isExitDialogOpen}
                    onOpenChange={setIsExitDialogOpen}
                    onConfirm={handleConfirmExit}
                />

                <StageSelector
                    stages={enabledStages}
                    currentStage={state.currentStage}
                    onStageSelect={handleStageSelect}
                    getStageStatus={getStageStatus}
                />

                {state.isLoading ? (
                    <TrainingLoading />
                ) : state.trainingWords.length === 0 ? (
                    <TrainingEmptyState />
                ) : !isStageEnabled ? (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-center text-gray-600">
                                Этап {state.currentStage} отключен в настройках.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <StageRenderer
                        stage={state.currentStage}
                        words={state.trainingWords}
                        onComplete={handleStageCompleteWrapper}
                        isLastStage={
                            enabledStages.length > 0 &&
                            enabledStages[enabledStages.length - 1] ===
                                state.currentStage
                        }
                    />
                )}
            </div>
        </div>
    );
}
