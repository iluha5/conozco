'use client';

import { CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressDots } from '../../common/ProgressDots';
import { useTranslation } from '@/lib/i18n';

type StageHeaderProps = {
    currentBatch: number;
    totalBatches: number;
    totalExercises: number;
    completedExercises: number;
    exerciseResults: (boolean | null)[];
    currentIndex: number;
};

export function StageHeader({
    currentBatch,
    totalBatches,
    totalExercises,
    completedExercises,
    exerciseResults,
    currentIndex,
}: StageHeaderProps) {
    const { t } = useTranslation();
    return (
        <CardHeader>
            <CardTitle className="text-center text-gray-600">
                {t('Match words')}
            </CardTitle>
            <p className="text-center text-sm text-gray-500">
                {t('Batch {{current}} of {{total}}', {
                    current: currentBatch + 1,
                    total: totalBatches,
                })}
            </p>
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
