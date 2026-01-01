'use client';

import { TrainingModeConfig } from '../types/typing';
import { TrainingModeCard } from './TrainingModeCard';
import { ActiveTrainingCard } from './ActiveTrainingCard';
import { useTranslation } from '@/lib/i18n';
import { SavedTrainingState } from '@/types/training.types';

interface TrainingModeCardsGridProps {
    modes: TrainingModeConfig[];
    onModeClick: (_modeId: string) => void;
    disabled?: boolean;
    variant?: 'default' | 'learned';
    showEmptyState?: boolean;
    emptyStateMessage?: string;
    activeTraining?: SavedTrainingState | null;
    onContinueTraining?: () => void;
}

export function TrainingModeCardsGrid({
    modes,
    onModeClick,
    disabled = false,
    variant = 'default',
    showEmptyState = false,
    emptyStateMessage,
    activeTraining,
    onContinueTraining,
}: TrainingModeCardsGridProps) {
    const { t } = useTranslation();

    if (showEmptyState && modes.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                {emptyStateMessage || t('No available modes')}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:grid-cols-4">
            {activeTraining && onContinueTraining && (
                <div className="md:max-w-[230px] lg:max-w-none">
                    <ActiveTrainingCard
                        savedState={activeTraining}
                        onClick={onContinueTraining}
                    />
                </div>
            )}
            {modes.map(mode => (
                <div key={mode.id} className="md:max-w-[230px] lg:max-w-none">
                    <TrainingModeCard
                        mode={mode}
                        onClick={() => onModeClick(mode.id)}
                        disabled={disabled}
                        variant={variant}
                    />
                </div>
            ))}
        </div>
    );
}
