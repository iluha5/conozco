'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, CheckCircle, XCircle, Settings } from 'lucide-react';
import { ProgressDots } from './progress-dots';
import { Stage5SettingsModal } from './stage-settings';
import { useStage5Settings } from '@/hooks/use-training-settings';

type Language = {
    id: string;
    code: string;
    name: string;
};

type Word = {
    id: string;
    userId: string;
    baseWordId?: string;
    customWord?: string;
    languageId: string;
    language: Language;
    status: 'NOT_LEARNED' | 'LEARNED';
    createdAt: string;
    updatedAt: string;
    baseWord?: {
        id: string;
        word: string;
        partOfSpeech: {
            id: string;
            name: string;
            displayName: string;
        };
        languageId: string;
        translations: Array<{
            translation: string;
            priority: number;
        }>;
        examples: Array<{
            example: string;
            translation: string;
            pronoun: {
                pronoun: string;
            };
            sentenceType?: {
                id: number;
                code: string;
                displayName: string;
                isNegative: boolean;
                isQuestion: boolean;
            };
        }>;
        grammaticalExamples: Array<{
            example: string;
            translation: string;
            pronoun: {
                pronoun: string;
            };
            tense: {
                name: string;
            };
            sentenceType?: {
                id: number;
                code: string;
                displayName: string;
                isNegative: boolean;
                isQuestion: boolean;
            };
        }>;
    };
};

type Stage5Props = {
    words: Word[];
    onComplete: () => void;
};

// Тип для фразы
type Phrase = {
    example: string;
    translation: string;
    pronoun: string;
    words: string[];
};

type WordState = {
    word: string;
    selected: boolean;
};

export function Stage5Training({ words, onComplete }: Stage5Props) {
    const { settings, updateSettings } = useStage5Settings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [currentPhrase, setCurrentPhrase] = useState<Phrase | null>(null);
    const [availableWords, setAvailableWords] = useState<WordState[]>([]);
    const [userSentence, setUserSentence] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [stats, setStats] = useState({ correct: 0, total: 0 });
    const [exerciseResults, setExerciseResults] = useState<boolean[]>([]);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [isFirstCard, setIsFirstCard] = useState(true);
    const [flashingWord, setFlashingWord] = useState<number | null>(null);
    const [fadeIn, setFadeIn] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [backgroundFlash, setBackgroundFlash] = useState<
        'green' | 'red' | null
    >(null);
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [totalErrors, setTotalErrors] = useState(0);
    const [isRetryMode, setIsRetryMode] = useState(false);
    const [hasCompletedFirstRound, setHasCompletedFirstRound] = useState(false);

    // Фильтруем слова, у которых есть фразы
    const wordsWithPhrases = useMemo(
        () =>
            words.filter(word => {
                const baseWord = word.baseWord;
                if (!baseWord) return false;

                const hasExamples =
                    baseWord.examples && baseWord.examples.length > 0;
                const hasGrammaticalExamples =
                    baseWord.grammaticalExamples &&
                    baseWord.grammaticalExamples.length > 0;

                return hasExamples || hasGrammaticalExamples;
            }),
        [words],
    );

    const currentWord = wordsWithPhrases[currentIndex];

    // Инициализируем массив фраз для всех слов
    const [wordPhrases, setWordPhrases] = useState<Phrase[][]>([]);

    // Обработчик изменения настроек
    const handleSettingsChange = (newSettings: typeof settings) => {
        updateSettings(newSettings);
        setShowSettingsModal(false);
        // Сбрасываем прогресс при изменении количества предложений
        setCurrentIndex(0);
        setCurrentPhraseIndex(0);
        setStats({ correct: 0, total: 0 });
        setIsFirstCard(true);
    };

    useEffect(() => {
        const phrases: Phrase[][] = wordsWithPhrases.map(word => {
            if (!word.baseWord) return [];

            const allPhrases: Phrase[] = [];

            // Добавляем простые примеры
            if (word.baseWord.examples) {
                word.baseWord.examples.forEach(example => {
                    allPhrases.push({
                        example: example.example,
                        translation: example.translation,
                        pronoun: example.pronoun.pronoun,
                        words: example.example
                            .split(' ')
                            .map(w =>
                                w.toLowerCase().replace(/[¿?¡!.,;:]/g, ''),
                            ),
                    });
                });
            }

            // Добавляем грамматические примеры
            if (word.baseWord.grammaticalExamples) {
                word.baseWord.grammaticalExamples.forEach(example => {
                    allPhrases.push({
                        example: example.example,
                        translation: example.translation,
                        pronoun: example.pronoun.pronoun,
                        words: example.example
                            .split(' ')
                            .map(w =>
                                w.toLowerCase().replace(/[¿?¡!.,;:]/g, ''),
                            ),
                    });
                });
            }

            // Ограничиваем до выбранного количества предложений, но не больше доступных
            return allPhrases.slice(0, settings.sentencesPerWord);
        });

        setWordPhrases(phrases);
        // Инициализируем массив результатов для всех упражнений
        const totalExercises = phrases.reduce(
            (total, wordPhrases) => total + wordPhrases.length,
            0,
        );
        setExerciseResults(new Array(totalExercises).fill(null));
    }, [wordsWithPhrases, settings.sentencesPerWord]);

    // Рассчитываем общий прогресс
    const totalPhrases = wordPhrases.reduce(
        (total, phrases) => total + phrases.length,
        0,
    );
    const currentPhraseNumber =
        wordPhrases
            .slice(0, currentIndex)
            .reduce((total, phrases) => total + phrases.length, 0) +
        currentPhraseIndex +
        1;

    // Запускаем анимацию при каждом монтировании компонента (при новом предложении)
    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 50);
        return () => clearTimeout(timer);
    }, [animationKey]);

    const getExtraWords = useCallback(
        (
            currentPronoun: string,
            languageCode: string,
            currentPhraseWords: string[],
        ): string[] => {
            const extraWords: string[] = [];

            // Собираем все слова из всех фраз всех слов
            const allWordsFromPhrases: string[] = [];
            const allPronouns: string[] = [];

            words.forEach(word => {
                if (!word.baseWord) return;

                // Собираем слова из примеров
                if (word.baseWord.examples) {
                    word.baseWord.examples.forEach(example => {
                        allWordsFromPhrases.push(
                            ...example.example
                                .split(' ')
                                .map(w =>
                                    w.toLowerCase().replace(/[¿?¡!.,;:]/g, ''),
                                ),
                        );
                    });
                }

                // Собираем слова из грамматических примеров
                if (word.baseWord.grammaticalExamples) {
                    word.baseWord.grammaticalExamples.forEach(example => {
                        allWordsFromPhrases.push(
                            ...example.example
                                .split(' ')
                                .map(w =>
                                    w.toLowerCase().replace(/[¿?¡!.,;:]/g, ''),
                                ),
                        );
                    });
                }
            });

            // Фильтруем слова, исключая слова из текущей фразы и местоимения
            const filteredWords = allWordsFromPhrases.filter(word => {
                return (
                    !currentPhraseWords.includes(word) &&
                    word.length > 1 &&
                    ![
                        'the',
                        'a',
                        'an',
                        'and',
                        'or',
                        'but',
                        'in',
                        'on',
                        'at',
                        'to',
                        'for',
                        'of',
                        'with',
                        'by',
                        'from',
                        'up',
                        'down',
                        'over',
                        'under',
                        'into',
                        'onto',
                        'out',
                        'off',
                        'through',
                        'during',
                        'before',
                        'after',
                        'above',
                        'below',
                        'between',
                        'among',
                        'throughout',
                        'against',
                        'along',
                        'around',
                        'behind',
                        'beside',
                        'near',
                        'next',
                        'inside',
                        'outside',
                        'within',
                        'without',
                        'across',
                        'along',
                        'around',
                        'behind',
                        'beside',
                        'near',
                        'next',
                        'inside',
                        'outside',
                        'within',
                        'without',
                        'across',
                    ].includes(word)
                );
            });

            // Убираем дубликаты
            const uniqueWords = Array.from(new Set(filteredWords));

            // Выбираем 5 случайных слов
            const shuffled = uniqueWords.sort(() => Math.random() - 0.5);
            return shuffled.slice(0, 5);
        },
        [words],
    );

    const initializePhrase = useCallback(() => {
        if (
            wordPhrases.length <= currentIndex ||
            wordPhrases[currentIndex].length <= currentPhraseIndex
        )
            return;

        const currentWordPhrases = wordPhrases[currentIndex];
        const phrase = currentWordPhrases[currentPhraseIndex];
        setCurrentPhrase(phrase);

        // Получаем дополнительные слова
        const extraWords = getExtraWords(
            phrase.pronoun,
            currentWord.language.code,
            phrase.words,
        );
        const allWords = [...phrase.words, ...extraWords];

        // Перемешиваем слова и создаем объекты состояния
        const shuffledWords = allWords.sort(() => Math.random() - 0.5);
        const wordStates: WordState[] = shuffledWords.map(word => ({
            word,
            selected: false,
        }));
        setAvailableWords(wordStates);
    }, [
        wordPhrases,
        currentIndex,
        currentPhraseIndex,
        currentWord,
        getExtraWords,
    ]);

    useEffect(() => {
        if (
            currentWord &&
            wordPhrases.length > currentIndex &&
            wordPhrases[currentIndex].length > 0
        ) {
            // Генерируем новый ключ для принудительного перемонтирования компонента
            setAnimationKey(prev => prev + 1);
            setFadeIn(false);

            initializePhrase();
            setUserSentence([]);
            setIsComplete(false);
            setIsCorrect(null);
            setTotalErrors(0);
            setFlashingWord(null);
            setBackgroundFlash(null);
            setShowResultPopup(false);
        }
    }, [
        currentIndex,
        currentPhraseIndex,
        wordPhrases,
        currentWord,
        initializePhrase,
    ]);

    const handleWordClick = async (index: number) => {
        if (isComplete) return;

        const word = availableWords[index].word;
        const correctPhrase = currentPhrase?.words || [];
        const nextExpectedWord = correctPhrase[userSentence.length];

        // Если слово правильное
        if (word.toLowerCase() === nextExpectedWord.toLowerCase()) {
            setUserSentence([...userSentence, word]);
            setAvailableWords(prev =>
                prev.map((item, i) =>
                    i === index ? { ...item, selected: true } : item,
                ),
            );

            // Если предложение завершено
            if (userSentence.length + 1 === correctPhrase.length) {
                await completePhrase(true);
            }
        } else {
            // Неправильное слово - показываем анимацию
            setFlashingWord(index);
            setTimeout(() => setFlashingWord(null), 150); // Анимация длится 0.15 сек

            const newErrorCount = totalErrors + 1;
            setTotalErrors(newErrorCount);

            // Если 3 ошибки всего за предложение - автоматически заполняем предложение
            if (newErrorCount >= 3) {
                await autoCompletePhrase();
            }
        }
    };

    const handleRemoveFromSentence = (index: number) => {
        if (isComplete) return;

        const word = userSentence[index];
        setUserSentence(userSentence.filter((_, i) => i !== index));

        // Найти это слово в массиве availableWords и снять выделение
        setAvailableWords(prev =>
            prev.map(item =>
                item.word === word && item.selected
                    ? { ...item, selected: false }
                    : item,
            ),
        );
    };

    const autoCompletePhrase = async () => {
        const correctPhrase = currentPhrase?.words || [];

        // Заполняем оставшиеся слова
        setUserSentence(correctPhrase);

        // Отмечаем все слова как выбранные
        setAvailableWords(prev =>
            prev.map(item => ({ ...item, selected: true })),
        );

        // Завершаем предложение как неправильное
        await completePhrase(false);
    };

    const completePhrase = async (correct: boolean) => {
        setIsCorrect(correct);
        setIsComplete(true);

        // Устанавливаем цвет фона и показываем попап с результатом
        setBackgroundFlash(correct ? 'green' : 'red');
        setShowResultPopup(true);

        // Обновляем результаты упражнения
        const exerciseIndex =
            wordPhrases
                .slice(0, currentIndex)
                .reduce((total, phrases) => total + phrases.length, 0) +
            currentPhraseIndex;
        setExerciseResults(prev => {
            const newResults = [...prev];
            newResults[exerciseIndex] = correct;
            return newResults;
        });

        // Записываем результат
        await fetch('/api/training', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                wordId: currentWord.id,
                stage: 5,
                isCorrect: correct,
            }),
        });

        // После первого ответа скрываем кнопку настроек
        if (isFirstCard) {
            setIsFirstCard(false);
        }

        setStats(prev => ({
            correct: prev.correct + (correct ? 1 : 0),
            total: prev.total + 1,
        }));

        // Если предложение составлено правильно - автоматически переходим через 1 секунду
        if (correct) {
            setTimeout(() => {
                if (isRetryMode) {
                    // В режиме исправления ошибок - ищем следующую ошибку с учетом обновленных результатов
                    const currentExerciseIndex =
                        wordPhrases
                            .slice(0, currentIndex)
                            .reduce(
                                (total, phrases) => total + phrases.length,
                                0,
                            ) + currentPhraseIndex;

                    setExerciseResults(currentResults => {
                        const nextErrorIndex = findNextErrorWithResults(
                            currentExerciseIndex,
                            currentResults,
                        );

                        if (nextErrorIndex === -1) {
                            // Все ошибки исправлены - даем время увидеть все зеленые точки, затем завершаем этап
                            setTimeout(() => {
                                onComplete();
                                setCurrentIndex(0);
                                setCurrentPhraseIndex(0);
                                setStats({ correct: 0, total: 0 });
                                setIsRetryMode(false);
                                setHasCompletedFirstRound(false);
                            }, 1500); // Дополнительная задержка для визуального подтверждения
                        } else {
                            // Переходим к следующей ошибке
                            const nextErrorPosition =
                                getWordAndPhraseIndex(nextErrorIndex);
                            if (nextErrorPosition) {
                                setCurrentIndex(nextErrorPosition.wordIndex);
                                setCurrentPhraseIndex(
                                    nextErrorPosition.phraseIndex,
                                );
                            }
                        }
                        return currentResults; // Возвращаем без изменений
                    });
                } else {
                    // Обычный режим
                    handleNext();
                }
            }, 1000);
        } else if (isRetryMode && !correct) {
            // В режиме повторения, если снова ошибка - переходим к следующей ошибке через 2 секунды
            setTimeout(() => {
                const currentExerciseIndex =
                    wordPhrases
                        .slice(0, currentIndex)
                        .reduce((total, phrases) => total + phrases.length, 0) +
                    currentPhraseIndex;
                const nextErrorIndex = findNextError(currentExerciseIndex);

                if (
                    nextErrorIndex === -1 ||
                    nextErrorIndex === currentExerciseIndex
                ) {
                    // Это единственная ошибка или других нет - остаемся на ней, но перезагружаем карточку
                    setAnimationKey(prev => prev + 1);
                    setFadeIn(false);
                    initializePhrase();
                    setUserSentence([]);
                    setIsComplete(false);
                    setIsCorrect(null);
                    setBackgroundFlash(null);
                    setShowResultPopup(false);
                } else {
                    const nextErrorPosition =
                        getWordAndPhraseIndex(nextErrorIndex);
                    if (nextErrorPosition) {
                        setCurrentIndex(nextErrorPosition.wordIndex);
                        setCurrentPhraseIndex(nextErrorPosition.phraseIndex);
                    }
                }
            }, 2000);
        }
    };

    // Функция для преобразования линейного индекса упражнения в (wordIndex, phraseIndex)
    const getWordAndPhraseIndex = (
        exerciseIndex: number,
    ): { wordIndex: number; phraseIndex: number } | null => {
        let accumulated = 0;
        for (let i = 0; i < wordPhrases.length; i++) {
            const phrasesCount = wordPhrases[i].length;
            if (exerciseIndex < accumulated + phrasesCount) {
                return {
                    wordIndex: i,
                    phraseIndex: exerciseIndex - accumulated,
                };
            }
            accumulated += phrasesCount;
        }
        return null;
    };

    // Функция для поиска следующей ошибки (с текущими результатами)
    const findNextErrorWithResults = (
        currentExerciseIndex: number,
        results: (boolean | null)[],
    ) => {
        // Ищем следующую ошибку после текущего индекса
        for (let i = currentExerciseIndex + 1; i < results.length; i++) {
            if (results[i] === false) {
                return i;
            }
        }
        // Если не нашли, ищем с начала до текущего индекса
        for (let i = 0; i <= currentExerciseIndex; i++) {
            if (results[i] === false) {
                return i;
            }
        }
        return -1; // Ошибок больше нет
    };

    // Функция для поиска следующей ошибки (использует текущее состояние)
    const findNextError = (currentExerciseIndex: number) => {
        return findNextErrorWithResults(currentExerciseIndex, exerciseResults);
    };

    const handleNext = () => {
        const currentWordPhrases = wordPhrases[currentIndex] || [];

        // Если есть еще предложения для текущего слова
        if (currentPhraseIndex < currentWordPhrases.length - 1) {
            setCurrentPhraseIndex(currentPhraseIndex + 1);
        } else {
            // Переходим к следующему слову
            setCurrentPhraseIndex(0);
            if (currentIndex < wordsWithPhrases.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                // Завершили все фразы первый раз
                setHasCompletedFirstRound(true);

                // Проверяем, есть ли ошибки
                const errorIndices = exerciseResults
                    .map((result, idx) => (result === false ? idx : -1))
                    .filter(idx => idx !== -1);

                if (errorIndices.length > 0) {
                    // Есть ошибки - переходим в режим исправления
                    setIsRetryMode(true);
                    const firstErrorPosition = getWordAndPhraseIndex(
                        errorIndices[0],
                    );
                    if (firstErrorPosition) {
                        setCurrentIndex(firstErrorPosition.wordIndex);
                        setCurrentPhraseIndex(firstErrorPosition.phraseIndex);
                    }
                } else {
                    // Все правильно - завершаем этап
                    onComplete();
                    setCurrentIndex(0);
                    setCurrentPhraseIndex(0);
                    setStats({ correct: 0, total: 0 });
                    setIsRetryMode(false);
                    setHasCompletedFirstRound(false);
                }
            }
        }
    };

    if (!currentWord || !currentPhrase) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-gray-600">
                        {wordsWithPhrases.length === 0
                            ? 'Нет слов с примерами для тренировки на этом этапе'
                            : 'Загрузка...'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
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
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-gray-600">
                            Составление предложения
                        </CardTitle>
                        {isFirstCard && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSettingsModal(true)}
                                className="p-2 h-auto"
                                title="Настройки тренировки"
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                    <div className="!mt-3">
                        <ProgressDots
                            totalExercises={totalPhrases}
                            completedExercises={
                                exerciseResults.filter(r => r !== null).length
                            }
                            exerciseResults={exerciseResults}
                            currentIndex={
                                wordPhrases
                                    .slice(0, currentIndex)
                                    .reduce(
                                        (total, phrases) =>
                                            total + phrases.length,
                                        0,
                                    ) + currentPhraseIndex
                            }
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Русский перевод фразы */}
                    <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600 mb-2">
                            {currentPhrase.translation}
                        </p>
                        <p className="text-gray-600">
                            Составьте предложение из слов
                        </p>
                    </div>

                    {/* Составленное предложение */}
                    <div className="relative min-h-[132px] p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {userSentence.length === 0 ? (
                                <p className="text-gray-400">
                                    Выберите слова ниже
                                </p>
                            ) : (
                                userSentence.map((word, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            !isComplete &&
                                            handleRemoveFromSentence(index)
                                        }
                                        disabled={isComplete}
                                        className="px-3 py-2 bg-white border-2 border-purple-500 rounded-lg text-gray-900 hover:bg-purple-50 transition-colors disabled:cursor-not-allowed font-medium"
                                    >
                                        {word}
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

                    {/* Доступные слова */}
                    <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                        {availableWords.map((wordState, index) => (
                            <div key={index} className="relative">
                                {wordState.selected ? (
                                    // Светло-серый блок-заполнитель для выбранных слов
                                    <div className="px-3 py-2 bg-gray-200 border-2 border-gray-300 rounded-lg text-gray-400 font-medium min-w-[60px] h-10 flex items-center justify-center">
                                        {wordState.word}
                                    </div>
                                ) : (
                                    // Активная кнопка для невыбранных слов
                                    <button
                                        onClick={() => handleWordClick(index)}
                                        disabled={isComplete}
                                        className={`px-3 py-2 rounded-lg text-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-w-[60px] h-10 ${
                                            flashingWord === index
                                                ? 'bg-red-500 border-red-500 text-white shadow-lg scale-110'
                                                : 'bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                        }`}
                                    >
                                        {wordState.word}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Кнопки действий - только для неправильных ответов */}
                    {isComplete && !isCorrect && (
                        <div className="flex justify-center pt-4">
                            <Button
                                size="lg"
                                onClick={handleNext}
                                className="gap-2"
                            >
                                Следующее предложение
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Stage5SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                settings={settings}
                onChange={handleSettingsChange}
            />
        </div>
    );
}
