'use client';

import { useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { TrainingHeader } from '@/components/training/common/TrainingHeader';
import { StageSelector } from '@/components/training/common/StageSelector';
import { TrainingEmptyState } from '@/components/training/common/TrainingEmptyState';
import { TrainingLoading } from '@/components/training/common/TrainingLoading';

const ExitConfirmationDialog = dynamic(() =>
    import('@/components/training/common/ExitConfirmationDialog').then(
        module => ({ default: module.ExitConfirmationDialog }),
    ),
);

const StageRenderer = dynamic(
    () =>
        import('@/components/training/common/StageRenderer').then(module => ({
            default: module.StageRenderer,
        })),
    { loading: () => <TrainingLoading /> },
);

const TrainingResults = dynamic(
    () =>
        import('@/components/training/common/TrainingResults').then(module => ({
            default: module.TrainingResults,
        })),
    { loading: () => <TrainingLoading /> },
);
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
import { useTranslation } from '@/lib/i18n';

const STORAGE_KEY = STORAGE_KEYS.TRAINING_PROGRESS;

export default function TrainingPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const { status } = useSession();
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

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/training/list');
        }
    }, [status, router]);

    // Check for unfinished training and redirect
    const { isStorageChecked, shouldRedirect } = useTrainingStorageCheck({
        selectedWordsCount: selectedWords.size,
    });

    // Load data - only after localStorage check
    useTrainingData(
        isStorageChecked && !shouldRedirect && settingsLoaded,
        isStorageChecked && !shouldRedirect && selectionLoaded,
        selectedWords,
        storage.savedState?.selectedWordIds,
        state.setWords,
        state.setIsLoading,
    );

    // Filter words for training
    const filteredWords = useTrainingWordsFilter(
        state.words,
        selectedLanguage,
        selectedWords,
    );

    // Enabled stages
    const enabledStages = useMemo(
        () =>
            trainingSettings
                ? (Array.from(
                      trainingSettings.enabledStages,
                  ).sort() as TrainingStage[])
                : ([1, 2, 3, 4, 5, 6] as TrainingStage[]),
        [trainingSettings],
    );

    // Initialize or restore training - only after localStorage check
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

    // Validate current stage - if disabled, switch to first enabled
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

    // Removed automatic sync - save only on user actions

    // Handlers
    const handleExit = () => setIsExitDialogOpen(true);

    const handlePause = () => {
        // Progress already saved in localStorage, go to training list page
        router.push('/training/list#new');
    };

    const handleConfirmExit = () => {
        // Clear saved state on exit
        storage.clearProgress();
        // Don't call setIsExitDialogOpen(false) - this will trigger history.back()
        // and create conflict with router.push. Dialog will close on transition.
        router.push('/training/list');
    };

    const handleStageCompleteWrapper = async () => {
        try {
            const result = await handleStageComplete(
                state.currentStage,
                new Set(enabledStages),
                state.trainingWords,
                storage.savedState?.stagesProgress || [],
            );

            // Always mark current stage as completed
            storage.completeStage(state.currentStage);

            if (result.completed && result.learnedWords) {
                // Training completed successfully
                state.setIsCompleted(true);
                state.setCompletedWords(result.learnedWords);

                // Read current state from localStorage for log saving
                const savedProgress = localStorage.getItem(STORAGE_KEY);
                if (savedProgress) {
                    try {
                        const currentState = JSON.parse(savedProgress);
                        await trainingApi.saveTrainingLog(currentState);
                    } catch (error) {
                        console.error('Failed to save training log:', error);
                    }
                }

                // Clear localStorage after successful completion
                storage.clearProgress();
            } else if (result.nextStage) {
                // Move to next stage (sequential completion)
                storage.setCurrentStage(result.nextStage);
                state.setCurrentStage(result.nextStage);
            } else {
                // Stage completed, but training not finished
                // Use small delay to let localStorage update
                setTimeout(() => {
                    const savedProgress = localStorage.getItem(STORAGE_KEY);

                    if (savedProgress) {
                        const currentState = JSON.parse(savedProgress);
                        const currentProgress =
                            currentState.stagesProgress || [];

                        // Find first unfinished stage and switch to it
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
        state.setCompletedWords(state.trainingWords);
    };

    // Manual stage switching handler
    const handleStageSelect = (stage: TrainingStage) => {
        state.setCurrentStage(stage);
        // Save on manual user switching
        storage.setCurrentStage(stage);
    };

    // Check if current stage is enabled
    const isStageEnabled = enabledStages.includes(state.currentStage);

    // Get stage statuses for highlighting
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

    // Guest users are redirected to training list
    if (status === 'unauthenticated' || status === 'loading') {
        return null;
    }

    // Show loader while localStorage is checked or redirect is performed
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

    // Render results screen
    if (state.isCompleted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <TrainingResults
                        completedWords={state.completedWords}
                        onReload={handleReloadWords}
                    />
                </div>
            </div>
        );
    }

    // Render main training screen
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
                                {t('Stage {{stage}} is disabled in settings.', {
                                    stage: state.currentStage,
                                })}
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
