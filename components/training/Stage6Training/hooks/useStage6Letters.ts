import { useState, useEffect, useCallback } from 'react';
import { initializeLetters } from '../helpers/initializeLetters';
import type { LetterState } from '../typing';

type UseStage6LettersParams = {
    currentWord: string | null;
    animationKey: number;
};

export function useStage6Letters({
    currentWord,
    animationKey,
}: UseStage6LettersParams) {
    const [letters, setLetters] = useState<LetterState[]>([]);

    const resetLetters = useCallback(() => {
        if (currentWord) {
            const letterStates = initializeLetters(currentWord);
            setLetters(letterStates);
        }
    }, [currentWord]);

    useEffect(() => {
        if (currentWord) {
            const letterStates = initializeLetters(currentWord);
            setLetters(letterStates);
        }
    }, [currentWord, animationKey]);

    return {
        letters,
        setLetters,
        resetLetters,
    };
}
