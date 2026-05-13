import { useState, useCallback } from 'react';
import type { LetterState } from '../typing';

type UseStage6WordBuildingParams = {
    currentWord: string;
    letters: LetterState[];
    setLetters: React.Dispatch<React.SetStateAction<LetterState[]>>;
};

export function useStage6WordBuilding({
    currentWord,
    letters,
    setLetters,
}: UseStage6WordBuildingParams) {
    const [userWord, setUserWord] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [flashingLetter, setFlashingLetter] = useState<number | null>(null);
    const [totalErrors, setTotalErrors] = useState(0);

    const handleLetterClick = useCallback(
        (index: number): boolean | null => {
            if (isComplete) return null;

            const letter = letters[index].letter;
            const correctWord = currentWord;
            const nextExpectedLetter = correctWord[userWord.length];

            if (letter.toLowerCase() === nextExpectedLetter.toLowerCase()) {
                setUserWord([...userWord, letter]);
                setLetters(prev =>
                    prev.map((item, itemIndex) =>
                        itemIndex === index
                            ? { ...item, selected: true }
                            : item,
                    ),
                );

                if (userWord.length + 1 === correctWord.length) {
                    setIsCorrect(true);
                    setIsComplete(true);
                    return true;
                }
                return null;
            } else {
                setFlashingLetter(index);
                // Animation duration is 0.15s
                setTimeout(() => setFlashingLetter(null), 150);

                const newErrorCount = totalErrors + 1;
                setTotalErrors(newErrorCount);

                // After 3 mistakes auto-fill the word
                if (newErrorCount >= 3) {
                    const correctLetters = correctWord.split('');
                    setUserWord(correctLetters);
                    setLetters(prev =>
                        prev.map(item => ({ ...item, selected: true })),
                    );
                    setIsCorrect(false);
                    setIsComplete(true);
                    return false;
                }
                return null;
            }
        },
        [isComplete, letters, currentWord, userWord, totalErrors, setLetters],
    );

    const handleRemoveFromWord = useCallback(
        (index: number) => {
            if (isComplete) return;

            const letter = userWord[index];
            setUserWord(userWord.filter((_, wordIndex) => wordIndex !== index));

            setLetters(prev =>
                prev.map(item =>
                    item.letter === letter && item.selected
                        ? { ...item, selected: false }
                        : item,
                ),
            );
        },
        [isComplete, userWord, setLetters],
    );

    const resetWordBuilding = useCallback(() => {
        setUserWord([]);
        setIsComplete(false);
        setIsCorrect(null);
        setTotalErrors(0);
        setFlashingLetter(null);
    }, []);

    return {
        userWord,
        isComplete,
        isCorrect,
        flashingLetter,
        handleLetterClick,
        handleRemoveFromWord,
        resetWordBuilding,
    };
}
