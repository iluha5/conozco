'use client';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { ProgressDots } from '../../common/ProgressDots';
import type { Phrase } from '../typing';
import { useTranslation } from '@/lib/i18n';

type StageHeaderProps = {
    totalPhrases: number;
    completedExercises: number;
    exerciseResults: (boolean | null)[];
    currentIndex: number;
    currentPhraseIndex: number;
    wordPhrases: Phrase[][];
    isFirstCard: boolean;
    onOpenSettings: () => void;
};

export function StageHeader({
    totalPhrases,
    completedExercises,
    exerciseResults,
    currentIndex,
    currentPhraseIndex,
    wordPhrases,
    isFirstCard,
    onOpenSettings,
}: StageHeaderProps) {
    const { t } = useTranslation();
    const currentExerciseIndex =
        wordPhrases
            .slice(0, currentIndex)
            .reduce((total, phrases) => total + phrases.length, 0) +
        currentPhraseIndex;

    return (
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-gray-600">
                    {t('Sentence building')}
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
                    totalExercises={totalPhrases}
                    completedExercises={completedExercises}
                    exerciseResults={exerciseResults}
                    currentIndex={currentExerciseIndex}
                />
            </div>
        </CardHeader>
    );
}
