import { useState, useCallback } from 'react';
import { TrainingStage, Word } from '@/types/training.types';

export function useTrainingState() {
    const [currentStage, setCurrentStage] = useState<TrainingStage>(1);
    const [words, setWords] = useState<Word[]>([]);
    const [trainingWords, setTrainingWords] = useState<Word[]>([]);
    const [completedWords, setCompletedWords] = useState<Word[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const resetTraining = useCallback(() => {
        setCurrentStage(1);
        setTrainingWords([]);
        setCompletedWords([]);
        setIsCompleted(false);
    }, []);

    return {
        currentStage,
        setCurrentStage,
        words,
        setWords,
        trainingWords,
        setTrainingWords,
        completedWords,
        setCompletedWords,
        isCompleted,
        setIsCompleted,
        isLoading,
        setIsLoading,
        resetTraining,
    };
}
