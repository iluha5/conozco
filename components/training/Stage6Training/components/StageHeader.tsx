'use client';

import { CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressDots } from '../../common/ProgressDots';
import { useTranslation } from '@/lib/i18n';

type StageHeaderProps = {
    totalExercises: number;
    completedExercises: number;
    exerciseResults: (boolean | null)[];
    currentIndex: number;
};

export function StageHeader({
    totalExercises,
    completedExercises,
    exerciseResults,
    currentIndex,
}: StageHeaderProps) {
    const { t } = useTranslation();
    return (
        <CardHeader>
            <CardTitle className="text-center text-gray-600">
                {t('Build word from voice')}
            </CardTitle>
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
