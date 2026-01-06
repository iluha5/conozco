'use client';

import { SavedTrainingState } from '@/types/training.types';
import { formatDate } from '@/components/training/common/helpers/formatDate';
import { useTranslation, useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Ellipsis } from '@/components/ui/ellipsis';
import { Trash2, PlayCircle } from 'lucide-react';

interface ActiveTrainingCardProps {
    savedState: SavedTrainingState;
    onClick: () => void;
    onDelete?: () => void;
}

export function ActiveTrainingCard({
    savedState,
    onClick,
    onDelete,
}: ActiveTrainingCardProps) {
    const { t } = useTranslation();
    const { language } = useI18n();

    const completedStages = savedState.stagesProgress.filter(
        sp => sp.status === 'completed',
    ).length;
    const totalStages = savedState.enabledStages.length;
    const progress = Math.round((completedStages / totalStages) * 100);

    const handleClick = () => {
        onClick();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.();
    };

    const getContinueText = () => {
        return (
            formatDate(savedState.lastUpdatedAt, language || 'en') +
            '. ' +
            t('Click to continue.')
        );
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                'relative aspect-square rounded-2xl p-6',
                'bg-white border-2 border-purple-400',
                'shadow-md hover:shadow-xl',
                'hover:border-purple-500',
                'transition-all duration-300',
                'cursor-pointer flex flex-col overflow-hidden group',
            )}
        >
            <div className="relative z-10 flex items-center justify-between mb-3">
                <div
                    className={cn(
                        'p-2 sm:p-3 rounded-xl transition-all duration-300',
                        'group-hover:scale-105 origin-center',
                        'bg-purple-400/10',
                    )}
                >
                    <PlayCircle
                        className={cn('w-5 h-5 md:w-8 md:h-8 text-purple-600')}
                    />
                </div>
                <div className="text-lg md:text-xl font-bold text-purple-700">
                    {progress}%
                </div>
                {onDelete && (
                    <button
                        onClick={handleDelete}
                        className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                        aria-label={t('Delete training')}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                )}
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center">
                <Ellipsis
                    className={cn(
                        'text-xl font-bold mb-1 sm:mb-2',
                        'text-gray-900 transition-all duration-300',
                        'group-hover:scale-105 origin-center',
                    )}
                >
                    {t('{{count}} words', {
                        count: savedState.totalWords,
                    })}
                </Ellipsis>
                <Ellipsis
                    className={cn(
                        'text-sm text-gray-600 transition-all duration-300',
                        'group-hover:scale-105 origin-center',
                    )}
                >
                    {getContinueText()}
                </Ellipsis>
            </div>
        </div>
    );
}
