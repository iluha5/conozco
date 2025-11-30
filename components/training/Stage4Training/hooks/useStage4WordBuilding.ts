import { useState, useCallback } from 'react';
import { getWordText } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';
import type { LetterState } from '../typing';
import type { TrainingStage } from '@/types/training.types';

type UseStage4WordBuildingParams = {
    currentWord: Word | undefined;
    letters: LetterState[];
    setLetters: React.Dispatch<React.SetStateAction<LetterState[]>>;
    recordAttempt: (
        _stage: TrainingStage,
        _wordId: string,
        _isCorrect: boolean,
    ) => void;
};

export function useStage4WordBuilding({
    currentWord,
    letters,
    setLetters,
    recordAttempt,
}: UseStage4WordBuildingParams) {
    const [userWord, setUserWord] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [totalErrors, setTotalErrors] = useState(0);
    const [flashingLetter, setFlashingLetter] = useState<number | null>(null);

    const handleLetterClick = useCallback(
        async (index: number) => {
            if (!currentWord) return;

            const letter = letters[index].letter;
            const correctWord = getWordText(currentWord);
            const nextExpectedLetter = correctWord[userWord.length];

            // Если буква правильная
            if (letter.toLowerCase() === nextExpectedLetter.toLowerCase()) {
                setUserWord([...userWord, letter]);
                setLetters(prevLetters =>
                    prevLetters.map((item, itemIndex) =>
                        itemIndex === index
                            ? { ...item, selected: true }
                            : item,
                    ),
                );

                // Если слово завершено
                if (userWord.length + 1 === correctWord.length) {
                    setIsComplete(true);
                    setIsCorrect(true);

                    // Записываем попытку в localStorage
                    recordAttempt(4, currentWord.id, true);

                    // Записываем результат в БД
                    await fetch('/api/training', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            wordId: currentWord.id,
                            stage: 4,
                            isCorrect: true,
                        }),
                    });
                }
            } else {
                // Неправильная буква - показываем анимацию
                setFlashingLetter(index);
                setTimeout(() => setFlashingLetter(null), 150); // Анимация длится 0.15 сек

                const newErrorCount = totalErrors + 1;
                setTotalErrors(newErrorCount);

                // Если 3 ошибки всего за слово - автоматически заполняем слово
                if (newErrorCount >= 3) {
                    const correctWordLetters = correctWord.split('');
                    setUserWord(correctWordLetters);
                    setLetters(prevLetters =>
                        prevLetters.map(item => ({ ...item, selected: true })),
                    );
                    setIsComplete(true);
                    setIsCorrect(false);

                    // Записываем попытку в localStorage
                    recordAttempt(4, currentWord.id, false);

                    // Записываем результат в БД
                    await fetch('/api/training', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            wordId: currentWord.id,
                            stage: 4,
                            isCorrect: false,
                        }),
                    });
                }
            }
        },
        [
            currentWord,
            letters,
            userWord,
            totalErrors,
            setLetters,
            recordAttempt,
        ],
    );

    const handleRemoveFromWord = useCallback(
        (index: number) => {
            const letter = userWord[index];
            setUserWord(userWord.filter((_, wordIndex) => wordIndex !== index));

            // Найти эту букву в массиве letters и снять выделение
            setLetters(prevLetters =>
                prevLetters.map(item =>
                    item.letter === letter && item.selected
                        ? { ...item, selected: false }
                        : item,
                ),
            );
        },
        [userWord, setLetters],
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
