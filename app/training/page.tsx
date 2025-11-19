'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { TrainingHeader } from '@/components/training/training-header';
import { ExitConfirmationDialog } from '@/components/training/exit-confirmation-dialog';
import { StageSelector } from '@/components/training/stage-selector';
import { StageRenderer } from '@/components/training/stage-renderer';
import { TrainingEmptyState } from '@/components/training/training-empty-state';
import { TrainingResults } from '@/components/training/training-results';
import { TrainingLoading } from '@/components/training/training-loading';
import {
    useTrainingState,
    useTrainingLogic,
    useTrainingWordsFilter,
    useTrainingData,
} from '@/hooks/training';
import { useTrainingSettings, useTrainingSelection } from '@/hooks/shared';
import { useTrainingWords } from '@/contexts/training-words-context';
import { trainingApi } from '@/lib/api/training.api';
import { TrainingStage } from '@/types/training.types';
import { Card, CardContent } from '@/components/ui/card';

export default function TrainingPage() {
    const router = useRouter();
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

    const { settings: trainingSettings, isLoaded: settingsLoaded } =
        useTrainingSettings();
    const { selectedLanguage, isLoaded: selectionLoaded } =
        useTrainingSelection();
    const { selectedWords } = useTrainingWords();

    const state = useTrainingState();
    const { handleStageComplete } = useTrainingLogic();

    // Загрузка данных
    useTrainingData(
        settingsLoaded,
        selectionLoaded,
        state.setWords,
        state.setIsLoading,
    );

    // Фильтрация слов для тренировки
    const filteredWords = useTrainingWordsFilter(
        state.words,
        selectedLanguage,
        selectedWords,
    );

    // Обновляем trainingWords при изменении фильтров
    useEffect(() => {
        state.setTrainingWords(filteredWords);
    }, [filteredWords, state]);

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

    // Проверка, что текущий этап включен
    useEffect(() => {
        const isCurrentStageEnabled = enabledStages.includes(
            state.currentStage,
        );
        if (!isCurrentStageEnabled && enabledStages.length > 0) {
            state.setCurrentStage(enabledStages[0]);
        }
    }, [enabledStages, state]);

    // Обработчики
    const handleExit = () => setIsExitDialogOpen(true);

    const handleConfirmExit = () => {
        setIsExitDialogOpen(false);
        router.push('/');
    };

    const handleStageCompleteWrapper = async () => {
        try {
            const result = await handleStageComplete(
                state.currentStage,
                new Set(enabledStages),
                state.trainingWords,
            );

            if (result.completed && result.learnedWords) {
                state.setIsCompleted(true);
                state.setCompletedWords(result.learnedWords);
            } else if (result.nextStage) {
                state.setCurrentStage(result.nextStage);
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
        router.push('/training/setup');
    };

    // Проверка, включен ли текущий этап
    const isStageEnabled = enabledStages.includes(state.currentStage);

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
                <TrainingHeader onExit={handleExit} />

                <ExitConfirmationDialog
                    open={isExitDialogOpen}
                    onOpenChange={setIsExitDialogOpen}
                    onConfirm={handleConfirmExit}
                />

                <StageSelector
                    stages={enabledStages}
                    currentStage={state.currentStage}
                    onStageSelect={state.setCurrentStage}
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
                    />
                )}
            </div>
        </div>
    );
}
