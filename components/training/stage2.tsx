'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { ProgressDots } from './progress-dots';
import {
    useFadeAnimation,
    useRecordResult,
    useExerciseResults,
    useRetryMode,
} from '@/hooks/training';
import { getWordText, getWordTranslation } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

type Stage2Props = {
    words: Word[];
    onComplete: () => void;
};

export function Stage2Training({ words, onComplete }: Stage2Props) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [stats, setStats] = useState({ correct: 0, total: 0 });

    const currentWord = words[currentIndex];

    // Используем новые хуки
    const { fadeIn, animationKey, triggerAnimation } = useFadeAnimation();
    const { exerciseResults, updateResult, setExerciseResults } =
        useExerciseResults({
            totalExercises: words.length,
        });
    const { recordResult } = useRecordResult();
    const {
        isRetryMode,
        hasCompletedFirstRound,
        findNextErrorWithResults,
        getErrorIndices,
        setIsRetryMode,
        setHasCompletedFirstRound,
    } = useRetryMode({
        totalExercises: words.length,
    });

    const generateOptions = useCallback(() => {
        const correctTranslation = getWordTranslation(currentWord);
        const otherWords = words.filter((w, idx) => idx !== currentIndex);

        // Выбираем 3 случайных неправильных ответа
        const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
        const wrongOptions = shuffledOthers
            .slice(0, 3)
            .map(w => getWordTranslation(w))
            .filter(t => t !== correctTranslation && t !== 'Нет перевода');

        // Добавляем правильный ответ и перемешиваем
        const allOptions = [...wrongOptions, correctTranslation].sort(
            () => Math.random() - 0.5,
        );

        setOptions(allOptions);
    }, [currentWord, currentIndex, words]);

    const handleNext = useCallback(() => {
        if (currentIndex < words.length - 1) {
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
    }, [
        currentIndex,
        words.length,
        exerciseResults,
        getErrorIndices,
        onComplete,
        setIsRetryMode,
        setHasCompletedFirstRound,
    ]);

    // Функция для поиска следующей ошибки (использует текущее состояние)
    const findNextError = useCallback(
        (startIndex: number) => {
            return findNextErrorWithResults(startIndex, exerciseResults);
        },
        [findNextErrorWithResults, exerciseResults],
    );

    useEffect(() => {
        if (currentWord) {
            // Триггерим новую анимацию
            triggerAnimation();

            // Генерируем опции для нового слова
            generateOptions();

            // Сбрасываем состояние выбора
            setSelectedOption(null);
            setIsCorrect(null);
        }
    }, [currentIndex, currentWord, generateOptions, triggerAnimation]);

    // Автоматический переход к следующему слову: 1сек при правильном ответе, 2сек при неправильном
    useEffect(() => {
        if (selectedOption !== null) {
            const delay = isCorrect ? 800 : 2000;
            const timer = setTimeout(() => {
                if (isRetryMode) {
                    // В режиме исправления ошибок
                    if (isCorrect) {
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
                            generateOptions();
                            setSelectedOption(null);
                            setIsCorrect(null);
                        } else {
                            setCurrentIndex(nextErrorIndex);
                        }
                    }
                } else {
                    // Обычный режим
                    handleNext();
                }
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [
        selectedOption,
        currentIndex,
        isCorrect,
        isRetryMode,
        exerciseResults,
        findNextError,
        generateOptions,
        handleNext,
        onComplete,
        setIsRetryMode,
        setHasCompletedFirstRound,
        findNextErrorWithResults,
        setExerciseResults,
        triggerAnimation,
    ]);

    const handleSelectOption = async (option: string) => {
        if (selectedOption !== null) return; // Уже выбрано

        setSelectedOption(option);
        const correctTranslation = getWordTranslation(currentWord);
        const correct = option === correctTranslation;
        setIsCorrect(correct);

        // Обновляем результаты упражнения
        updateResult(currentIndex, correct);

        // Записываем результат (API + localStorage)
        await recordResult(2, currentWord.id, correct);

        setStats(prev => ({
            correct: prev.correct + (correct ? 1 : 0),
            total: prev.total + 1,
        }));
    };

    if (!currentWord) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card
                key={animationKey}
                className={`shadow-xl transition-opacity duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
            >
                <CardHeader>
                    <CardTitle className="text-center text-gray-600">
                        Выбор правильного перевода
                    </CardTitle>
                    <div className="!mt-3">
                        <ProgressDots
                            totalExercises={words.length}
                            completedExercises={
                                exerciseResults.filter(r => r !== null).length
                            }
                            exerciseResults={exerciseResults}
                            currentIndex={currentIndex}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-5xl font-bold text-gray-900 mb-2">
                            {getWordText(currentWord)}
                        </h2>
                        <p className="text-gray-600">
                            Выберите правильный перевод
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {options.map((option, index) => {
                            const isSelected = selectedOption === option;
                            const correctTranslation =
                                getWordTranslation(currentWord);
                            const isCorrectOption =
                                option === correctTranslation;

                            let buttonClass =
                                'h-auto py-4 text-lg justify-start';
                            let variant: 'default' | 'outline' | 'secondary' =
                                'outline';

                            if (isSelected) {
                                if (isCorrect) {
                                    buttonClass +=
                                        ' bg-green-100 border-green-500 hover:bg-green-100';
                                } else {
                                    buttonClass +=
                                        ' bg-red-100 border-red-500 hover:bg-red-100';
                                }
                            } else if (
                                selectedOption !== null &&
                                isCorrectOption
                            ) {
                                buttonClass += ' bg-green-100 border-green-500';
                            }

                            return (
                                <Button
                                    key={index}
                                    variant={variant}
                                    className={buttonClass}
                                    onClick={() => handleSelectOption(option)}
                                    disabled={selectedOption !== null}
                                >
                                    <span className="flex-1 text-left">
                                        {option}
                                    </span>
                                    {isSelected && isCorrect && (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    )}
                                    {isSelected && !isCorrect && (
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    {selectedOption !== null &&
                                        !isSelected &&
                                        isCorrectOption && (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        )}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
