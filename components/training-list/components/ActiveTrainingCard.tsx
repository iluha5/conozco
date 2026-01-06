'use client';

import { SavedTrainingState } from '@/types/training.types';
import { formatDate } from '@/components/training/common/helpers/formatDate';
import { useTranslation, useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Clock, BookOpen, ArrowRight, Trash2 } from 'lucide-react';

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
            <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center justify-center transition-all duration-300 group-hover:scale-105 origin-center">
                    <PlayCircle className="w-5 h-5 md:w-8 md:h-8 text-purple-600 animate-pulse-scale" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0 text-lg md:text-xl font-bold text-purple-700">
                    {progress}%
                </div>
                {onDelete && (
                    <button
                        onClick={handleDelete}
                        className="md:hidden p-1.5 hover:bg-red-50 rounded-full transition-colors"
                        aria-label={t('Delete training')}
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                )}
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-start space-y-2">
                <div className="flex flex-col gap-2">
                    <Badge
                        variant="purple"
                        size="md"
                        className="gap-1.5 font-normal"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>
                            {t('{{count}} words', {
                                count: savedState.totalWords,
                            })}
                        </span>
                    </Badge>
                    <Badge
                        variant="purple"
                        size="md"
                        className="gap-1.5 font-normal"
                    >
                        <Clock className="w-4 h-4" />
                        <span>
                            {formatDate(
                                savedState.lastUpdatedAt,
                                language || 'en',
                            )}
                        </span>
                    </Badge>
                </div>
                <div className="hidden md:flex items-center justify-between gap-1.5 text-sm font-medium text-purple-700 !mt-4">
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                            aria-label={t('Delete training')}
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                        <span>{t('Continue')}</span>
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
