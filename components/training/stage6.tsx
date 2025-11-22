'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Volume2 } from 'lucide-react';
import { ProgressDots } from './progress-dots';
import {
    useFadeAnimation,
    useRecordResult,
    useExerciseResults,
    useRetryMode,
    useSpeech,
} from '@/hooks/training';
import { getWordText } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

type Stage6Props = {
    words: Word[];
    onComplete: () => void;
};

type LetterState = {
    letter: string;
    selected: boolean;
};

export function Stage6Training({ words, onComplete }: Stage6Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [letters, setLetters] = useState<LetterState[]>([]);
    const [userWord, setUserWord] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [_stats, setStats] = useState({ correct: 0, total: 0 });
    const [flashingLetter, setFlashingLetter] = useState<number | null>(null);
    const [backgroundFlash, setBackgroundFlash] = useState<
        'green' | 'red' | null
    >(null);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [totalErrors, setTotalErrors] = useState(0);

    // Filter only base words (exclude custom words)
    const baseWords = words.filter(word => word.baseWordId && !word.customWord);
    const currentWord = baseWords[currentIndex];

    // Используем новые хуки
    const { fadeIn, animationKey, triggerAnimation } = useFadeAnimation();
    const { exerciseResults, updateResult, setExerciseResults } =
        useExerciseResults({
            totalExercises: baseWords.length,
        });
    const { recordResult } = useRecordResult();
    const {
        isRetryMode,
        findNextErrorWithResults,
        getErrorIndices,
        setIsRetryMode,
        setHasCompletedFirstRound,
    } = useRetryMode({
        totalExercises: baseWords.length,
    });
    const {
        speak,
        isPlaying,
        isSupported: speechSupported,
    } = useSpeech({
        languageCode: currentWord?.language.code || 'en',
    });

    const initializeLetters = useCallback(() => {
        const word = getWordText(currentWord);
        const wordLetters = word.split('');
        const shuffled = [...wordLetters].sort(() => Math.random() - 0.5);

        // Add 3 random letters
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const randomLetters = [];
        for (let i = 0; i < 3; i++) {
            const randomLetter =
                alphabet[Math.floor(Math.random() * alphabet.length)];
            randomLetters.push(randomLetter);
        }

        const allLetters = [...shuffled, ...randomLetters];
        const finalShuffled = allLetters.sort(() => Math.random() - 0.5);

        const letterStates: LetterState[] = finalShuffled.map(letter => ({
            letter,
            selected: false,
        }));
        setLetters(letterStates);
    }, [currentWord]);

    // Инициализируем буквы при смене слова
    useEffect(() => {
        triggerAnimation();
        initializeLetters();
        setUserWord([]);
        setIsComplete(false);
        setIsCorrect(null);
        setBackgroundFlash(null);
        setShowResultPopup(false);
        setTotalErrors(0);
        setFlashingLetter(null);
    }, [currentIndex, initializeLetters, triggerAnimation]);

    const handleLetterClick = async (index: number) => {
        const letter = letters[index].letter;
        const correctWord = getWordText(currentWord);
        const nextExpectedLetter = correctWord[userWord.length];

        // Если буква правильная
        if (letter.toLowerCase() === nextExpectedLetter.toLowerCase()) {
            setUserWord([...userWord, letter]);
            setLetters(prev =>
                prev.map((item, i) =>
                    i === index ? { ...item, selected: true } : item,
                ),
            );

            // Если слово завершено
            if (userWord.length + 1 === correctWord.length) {
                await completeWord(true);
            }
        } else {
            // Неправильная буква - показываем анимацию
            setFlashingLetter(index);
            setTimeout(() => setFlashingLetter(null), 150); // Анимация длится 0.15 сек

            const newErrorCount = totalErrors + 1;
            setTotalErrors(newErrorCount);

            // Если 3 ошибки всего за слово - автоматически заполняем слово
            if (newErrorCount >= 3) {
                await autoCompleteWord();
            }
        }
    };

    const handleRemoveFromWord = (index: number) => {
        const letter = userWord[index];
        setUserWord(userWord.filter((_, i) => i !== index));

        // Найти эту букву в массиве letters и снять выделение
        setLetters(prev =>
            prev.map(item =>
                item.letter === letter && item.selected
                    ? { ...item, selected: false }
                    : item,
            ),
        );
    };

    const completeWord = async (correct: boolean) => {
        setIsCorrect(correct);
        setIsComplete(true);

        // Устанавливаем цвет фона и показываем попап с результатом
        setBackgroundFlash(correct ? 'green' : 'red');
        setShowResultPopup(true);

        // Обновляем результаты упражнения
        updateResult(currentIndex, correct);

        // Записываем результат (API + localStorage)
        await recordResult(6, currentWord.id, correct);

        setStats(prev => ({
            correct: prev.correct + (correct ? 1 : 0),
            total: prev.total + 1,
        }));

        // Автоматический переход
        const delay = correct ? 1000 : 2000;
        setTimeout(() => {
            if (isRetryMode) {
                // В режиме исправления ошибок
                if (correct) {
                    // Исправил ошибку - ищем следующую ошибку с учетом обновленных результатов
                    setExerciseResults(currentResults => {
                        const nextErrorIndex = findNextErrorWithResults(
                            currentIndex,
                            currentResults,
                        );
                        if (nextErrorIndex === -1) {
                            // Все ошибки исправлены - даем время увидеть все зеленые точки, затем завершаем этап
                            setTimeout(() => {
                                onComplete();
                                setCurrentIndex(0);
                                setStats({ correct: 0, total: 0 });
                                setIsRetryMode(false);
                                setHasCompletedFirstRound(false);
                            }, 1500); // Дополнительная задержка для визуального подтверждения
                        } else {
                            // Переходим к следующей ошибке
                            setCurrentIndex(nextErrorIndex);
                        }
                        return currentResults; // Возвращаем без изменений
                    });
                } else {
                    // Снова ошибся - переходим к следующей ошибке (или к этой же, если она одна)
                    const nextErrorIndex = findNextError(currentIndex);
                    if (
                        nextErrorIndex === -1 ||
                        nextErrorIndex === currentIndex
                    ) {
                        // Это единственная ошибка или других нет - остаемся на ней, но перезагружаем карточку
                        triggerAnimation();
                        initializeLetters();
                        setUserWord([]);
                        setIsComplete(false);
                        setIsCorrect(null);
                        setBackgroundFlash(null);
                        setShowResultPopup(false);
                        setTotalErrors(0);
                        setFlashingLetter(null);
                        // Автоматически проигрываем слово снова
                        setTimeout(() => speak(getWordText(currentWord)), 500);
                    } else {
                        setCurrentIndex(nextErrorIndex);
                    }
                }
            } else {
                // Обычный режим - всегда переходим к следующему (или в retry mode)
                handleNext();
            }
        }, delay);
    };

    const autoCompleteWord = async () => {
        const correctWord = getWordText(currentWord);
        const correctLetters = correctWord.split('');

        // Заполняем оставшиеся буквы
        setUserWord(correctLetters);

        // Отмечаем все буквы как выбранные
        setLetters(prev => prev.map(item => ({ ...item, selected: true })));

        // Завершаем слово как неправильное
        await completeWord(false);
    };

    // Функция для поиска следующей ошибки (использует текущее состояние)
    const findNextError = useCallback(
        (startIndex: number) => {
            return findNextErrorWithResults(startIndex, exerciseResults);
        },
        [findNextErrorWithResults, exerciseResults],
    );

    const handleNext = () => {
        if (currentIndex < baseWords.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Завершили все слова первый раз
            setHasCompletedFirstRound(true);

            // Проверяем, есть ли ошибки
            const errorIndices = getErrorIndices(exerciseResults);

            if (errorIndices.length > 0) {
                // Есть ошибки - переходим в режим исправления
                setIsRetryMode(true);
                setCurrentIndex(errorIndices[0]);
            } else {
                // Все правильно - завершаем этап
                onComplete();
                setCurrentIndex(0);
                setStats({ correct: 0, total: 0 });
                setIsRetryMode(false);
                setHasCompletedFirstRound(false);
            }
        }
    };

    if (!currentWord) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-gray-600">
                        Нет основных слов для тренировки. Добавьте слова из
                        словаря!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card
                key={animationKey}
                className={`shadow-xl transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'} ${
                    backgroundFlash === 'green'
                        ? 'bg-green-50 border-green-400'
                        : backgroundFlash === 'red'
                          ? 'bg-red-50 border-red-400'
                          : ''
                }`}
            >
                <CardHeader>
                    <CardTitle className="text-center text-gray-600">
                        Составление слова по голосу
                    </CardTitle>
                    <div className="!mt-3">
                        <ProgressDots
                            totalExercises={baseWords.length}
                            completedExercises={
                                exerciseResults.filter(r => r !== null).length
                            }
                            exerciseResults={exerciseResults}
                            currentIndex={currentIndex}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center mb-6">
                        <p className="text-gray-600 mb-4">
                            Послушайте слово и составьте его из букв
                        </p>

                        <Button
                            onClick={() => speak(getWordText(currentWord))}
                            disabled={isPlaying || !speechSupported}
                            variant="outline"
                            size="sm"
                            className="gap-2 mt-2"
                        >
                            <Volume2
                                className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`}
                            />
                            {isPlaying
                                ? 'Проигрывается...'
                                : 'Прослушать слово'}
                        </Button>
                    </div>

                    {/* Собранное слово */}
                    <div className="relative min-h-[132px] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {userWord.length === 0 ? (
                                <p className="text-gray-400">
                                    Выберите буквы ниже
                                </p>
                            ) : (
                                userWord.map((letter, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            !isComplete &&
                                            handleRemoveFromWord(index)
                                        }
                                        disabled={isComplete}
                                        className="w-12 h-12 bg-white border-2 border-purple-500 rounded-lg text-xl font-bold text-gray-900 hover:bg-purple-50 transition-colors disabled:cursor-not-allowed"
                                    >
                                        {letter}
                                    </button>
                                ))
                            )}
                        </div>

                        {/* Попап с результатом */}
                        {showResultPopup && (
                            <div className="absolute bottom-2 right-2 pointer-events-none">
                                <div
                                    className={`p-2 rounded-lg border-2 shadow-lg transform transition-all duration-500 ease-out ${
                                        isCorrect
                                            ? 'bg-green-50 border-green-400 text-green-600'
                                            : 'bg-red-50 border-red-400 text-red-600'
                                    } ${
                                        showResultPopup
                                            ? 'opacity-100 translate-y-0 scale-100'
                                            : 'opacity-0 translate-y-2 scale-95'
                                    }`}
                                >
                                    {isCorrect ? (
                                        <CheckCircle className="w-6 h-6" />
                                    ) : (
                                        <XCircle className="w-6 h-6" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Доступные буквы */}
                    <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                        {letters.map((letterState, index) => (
                            <div key={index} className="relative w-12 h-12">
                                {letterState.selected ? (
                                    // Светло-серый блок-заполнитель для выбранных букв с текстом
                                    <div className="w-full h-full bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
                                        <span className="text-xl font-bold text-gray-400">
                                            {letterState.letter}
                                        </span>
                                    </div>
                                ) : (
                                    // Активная кнопка для невыбранных букв
                                    <button
                                        onClick={() => handleLetterClick(index)}
                                        disabled={isComplete}
                                        className={`w-full h-full rounded-lg text-xl font-bold text-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                            flashingLetter === index
                                                ? 'bg-red-500 border-red-500 text-white shadow-lg scale-110'
                                                : 'bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                        }`}
                                    >
                                        {letterState.letter}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
