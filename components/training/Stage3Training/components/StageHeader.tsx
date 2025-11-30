import { CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressDots } from '../../ProgressDots';

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
    return (
        <CardHeader>
            <CardTitle className="text-center text-gray-600">
                Сопоставление слов
            </CardTitle>
            <p className="text-center text-sm text-gray-500">
                Группа {currentBatch + 1} из {totalBatches}
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
