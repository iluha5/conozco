import { CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressDots } from '../../ProgressDots';

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
    return (
        <CardHeader>
            <CardTitle className="text-center text-gray-600">
                Составление слова по голосу
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
