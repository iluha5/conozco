'use client';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { ProgressDots } from '../../common/ProgressDots';
import { useTranslation } from '@/lib/i18n';

type StageHeaderProps = {
    totalExercises: number;
    completedExercises: number;
    exerciseResults: (boolean | null)[];
    currentIndex: number;
    isFirstCard: boolean;
    onOpenSettings: () => void;
};

export function StageHeader({
    totalExercises,
    completedExercises,
    exerciseResults,
    currentIndex,
    isFirstCard,
    onOpenSettings,
}: StageHeaderProps) {
    const { t } = useTranslation();
    return (
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-gray-600">
                    {t('Word building from letters')}
                </CardTitle>
                {isFirstCard && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onOpenSettings}
                        className="p-2 h-auto"
                        title={t('Training settings')}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                )}
            </div>
            <div className="!mt-3">
                <ProgressDots
                    totalExercises={totalExercises}
                    completedExercises={completedExercises}
                    exerciseResults={exerciseResults}
                    currentIndex={currentIndex}
                />
            </div>
        </CardHeader>
    );
}
