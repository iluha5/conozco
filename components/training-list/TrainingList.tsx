'use client';

import { TrainingModeCard } from './components/TrainingModeCard';
import { NoWordsDialog } from './components/NoWordsDialog';
import { NewTrainingConfirmationDialog } from '@/components/training/common/NewTrainingConfirmationDialog';
import { useTrainingModes } from './hooks/useTrainingModes';
import { Loader2 } from 'lucide-react';

export function TrainingList() {
    const {
        modes,
        startMode,
        isLoading,
        isStarting,
        showNoWordsDialog,
        setShowNoWordsDialog,
        showConfirmDialog,
        setShowConfirmDialog,
        handleContinueExisting,
        handleStartNew,
        isContinueLoading,
    } = useTrainingModes();

    const handleModeClick = (modeId: string) => {
        startMode(modeId as any);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Режимы тренировок
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Выберите подходящий режим тренировки или настройте свой
                    собственный
                </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {modes.map(mode => (
                    <TrainingModeCard
                        key={mode.id}
                        mode={mode}
                        onClick={() => handleModeClick(mode.id)}
                        disabled={isStarting}
                    />
                ))}
            </div>

            <NoWordsDialog
                open={showNoWordsDialog}
                onOpenChange={setShowNoWordsDialog}
            />

            <NewTrainingConfirmationDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                onContinue={handleContinueExisting}
                onStartNew={handleStartNew}
                continueLoading={isContinueLoading}
                startNewLoading={isStarting}
            />
        </div>
    );
}
