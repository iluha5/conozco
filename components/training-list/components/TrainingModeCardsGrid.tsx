import { TrainingModeConfig } from '../types/typing';
import { TrainingModeCard } from './TrainingModeCard';

interface TrainingModeCardsGridProps {
    modes: TrainingModeConfig[];
    onModeClick: (modeId: string) => void;
    disabled?: boolean;
    variant?: 'default' | 'learned';
    showEmptyState?: boolean;
    emptyStateMessage?: string;
}

export function TrainingModeCardsGrid({
    modes,
    onModeClick,
    disabled = false,
    variant = 'default',
    showEmptyState = false,
    emptyStateMessage,
}: TrainingModeCardsGridProps) {
    if (showEmptyState && modes.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                {emptyStateMessage || 'Нет доступных режимов'}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:grid-cols-4">
            {modes.map(mode => (
                <div
                    key={mode.id}
                    className="md:max-w-[230px] lg:max-w-none"
                >
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

