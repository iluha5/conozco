import { useState, useCallback } from 'react';
import type { Phrase, WordState } from '../typing';

type UseStage5SentenceBuildingParams = {
    currentPhrase: Phrase | null;
    availableWords: WordState[];
    setAvailableWords: React.Dispatch<React.SetStateAction<WordState[]>>;
};

export function useStage5SentenceBuilding({
    currentPhrase,
    availableWords,
    setAvailableWords,
}: UseStage5SentenceBuildingParams) {
    const [userSentence, setUserSentence] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [flashingWord, setFlashingWord] = useState<number | null>(null);
    const [totalErrors, setTotalErrors] = useState(0);

    const handleWordClick = useCallback(
        (index: number): boolean | null => {
            if (isComplete) return null;

            const word = availableWords[index].word;
            const correctPhrase = currentPhrase?.words || [];
            const nextExpectedWord = correctPhrase[userSentence.length];

            if (word.toLowerCase() === nextExpectedWord.toLowerCase()) {
                setUserSentence([...userSentence, word]);
                setAvailableWords(prev =>
                    prev.map((item, itemIndex) =>
                        itemIndex === index
                            ? { ...item, selected: true }
                            : item,
                    ),
                );

                if (userSentence.length + 1 === correctPhrase.length) {
                    setIsCorrect(true);
                    setIsComplete(true);
                    return true;
                }
                return null;
            } else {
                setFlashingWord(index);
                // Animation duration is 0.15s
                setTimeout(() => setFlashingWord(null), 150);

                const newErrorCount = totalErrors + 1;
                setTotalErrors(newErrorCount);

                // After 3 mistakes auto-fill the sentence
                if (newErrorCount >= 3) {
                    const correctPhraseWords = currentPhrase?.words || [];
                    setUserSentence(correctPhraseWords);
                    setAvailableWords(prev =>
                        prev.map(item => ({ ...item, selected: true })),
                    );
                    setIsCorrect(false);
                    setIsComplete(true);
                    return false;
                }
                return null;
            }
        },
        [
            isComplete,
            availableWords,
            currentPhrase,
            userSentence,
            totalErrors,
            setAvailableWords,
        ],
    );

    const handleRemoveFromSentence = useCallback(
        (index: number) => {
            if (isComplete) return;

            const word = userSentence[index];
            setUserSentence(
                userSentence.filter(
                    (_, sentenceIndex) => sentenceIndex !== index,
                ),
            );

            setAvailableWords(prev =>
                prev.map(item =>
                    item.word === word && item.selected
                        ? { ...item, selected: false }
                        : item,
                ),
            );
        },
        [isComplete, userSentence, setAvailableWords],
    );

    const resetSentenceBuilding = useCallback(() => {
        setUserSentence([]);
        setIsComplete(false);
        setIsCorrect(null);
        setTotalErrors(0);
        setFlashingWord(null);
    }, []);

    return {
        userSentence,
        isComplete,
        isCorrect,
        flashingWord,
        handleWordClick,
        handleRemoveFromSentence,
        resetSentenceBuilding,
    };
}
