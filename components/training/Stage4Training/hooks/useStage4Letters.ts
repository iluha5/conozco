import { useState, useEffect, useCallback } from 'react';
import { initializeLetters } from '../helpers/initializeLetters';
import type { Word } from '@/types/training.types';
import type { LetterState } from '../typing';
import type { Stage4Settings } from '@/lib/training-settings';

type UseStage4LettersParams = {
    currentWord: Word | undefined;
    difficulty: Stage4Settings['difficulty'];
    animationKey: number;
};

export function useStage4Letters({
    currentWord,
    difficulty,
    animationKey,
}: UseStage4LettersParams) {
    const [letters, setLetters] = useState<LetterState[]>([]);

    const resetLetters = useCallback(() => {
        if (currentWord) {
            const newLetters = initializeLetters(currentWord, difficulty);
            setLetters(newLetters);
        }
    }, [currentWord, difficulty]);

    useEffect(() => {
        resetLetters();
    }, [resetLetters, animationKey]);

    return {
        letters,
        setLetters,
        resetLetters,
    };
}
