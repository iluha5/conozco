'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, ChevronRight, Settings } from 'lucide-react';
import { ProgressDots } from './progress-dots';
import { Stage1SettingsModal } from './stage-settings';
import { useStage1Settings } from '@/hooks/use-training-settings';

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
    };
    customTranslations?: Array<{
        id: number;
        translation: string;
    }>;
};

type Stage1Props = {
    words: Word[];
    onComplete: () => void;
};

export function Stage1Training({ words, onComplete }: Stage1Props) {
    const { settings, updateSettings } = useStage1Settings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [exerciseResults, setExerciseResults] = useState<boolean[]>([]);
    const [fadeIn, setFadeIn] = useState(false);
    const [animationKey, setAnimationKey] = useState(0);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const currentWord = words[currentIndex];

    // Обработчик изменения настроек
    const handleSettingsChange = (newSettings: { showExamples: boolean }) => {
        updateSettings(newSettings);
        setShowSettingsModal(false);
    };

    // Инициализируем массив результатов упражнений
    useEffect(() => {
        setExerciseResults(new Array(words.length).fill(null));
    }, [words.length]);

    // Запускаем анимацию при каждом монтировании компонента (при новом слове)
    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 50);
        return () => clearTimeout(timer);
    }, [animationKey]);

    const speakWord = useCallback(() => {
        if ('speechSynthesis' in window && currentWord) {
            const word =
                currentWord.baseWord?.word || currentWord.customWord || '';
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang =
                currentWord.language.code === 'en' ? 'en-US' : 'es-ES';
            utterance.rate = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    }, [currentWord]);

    useEffect(() => {
        // Автоматическая озвучка при появлении нового слова
        if (currentWord) {
            // Генерируем новый ключ для принудительного перемонтирования компонента
            setAnimationKey(prev => prev + 1);
            setFadeIn(false);
            setShowTranslation(false);
            speakWord();
        }
    }, [currentIndex, currentWord, speakWord]);

    const handleNext = async () => {
        // Записываем результат тренировки
        await fetch('/api/training', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                wordId: currentWord.id,
                stage: 1,
                isCorrect: true, // На 1 этапе всегда true, так как это просто просмотр
            }),
        });

        // Обновляем результаты упражнения
        setExerciseResults(prev => {
            const newResults = [...prev];
            newResults[currentIndex] = true;
            return newResults;
        });

        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete();
            setCurrentIndex(0);
        }
    };

    if (!currentWord) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card
                key={animationKey}
                className={`shadow-xl transition-all duration-300 ease-in-out ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
            >
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-gray-600">
                            Просмотр и запоминание
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSettingsModal(true)}
                            className="p-2 h-auto"
                            title="Настройки тренировки"
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="!mt-3">
                        <ProgressDots
                            totalExercises={words.length}
                            completedExercises={currentIndex}
                            exerciseResults={exerciseResults}
                            currentIndex={currentIndex}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-4 mb-2">
                            <h2 className="text-5xl font-bold text-gray-900">
                                {currentWord.baseWord?.word ||
                                    currentWord.customWord}
                            </h2>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={speakWord}
                                className="rounded-full w-12 h-12"
                            >
                                <Volume2 className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="relative mt-4 flex items-center justify-center">
                            {/* Перевод (всегда присутствует, но скрыт/показан) */}
                            <div
                                className={`inset-0 flex items-center justify-center transition-opacity duration-300 ${
                                    showTranslation
                                        ? 'opacity-100'
                                        : 'opacity-0 pointer-events-none'
                                }`}
                            >
                                <div className="space-y-4 text-center">
                                    <p className="text-3xl text-purple-600 font-semibold">
                                        {currentWord.customTranslations &&
                                        currentWord.customTranslations.length >
                                            0
                                            ? currentWord.customTranslations[0]
                                                  .translation
                                            : currentWord.baseWord
                                                    ?.translations &&
                                                currentWord.baseWord
                                                    .translations.length > 0
                                              ? currentWord.baseWord
                                                    .translations[0].translation
                                              : 'Нет перевода'}
                                    </p>
                                    {settings.showExamples &&
                                        currentWord.baseWord?.examples &&
                                        currentWord.baseWord.examples.length >
                                            0 && (
                                            <div className="text-gray-600 space-y-2">
                                                <p className="font-medium text-sm">
                                                    Примеры:
                                                </p>
                                                {currentWord.baseWord.examples
                                                    .slice(0, 2)
                                                    .map((example, idx) => (
                                                        <p
                                                            key={idx}
                                                            className="text-sm italic"
                                                        >
                                                            • {example.example}{' '}
                                                            -{' '}
                                                            {
                                                                example.translation
                                                            }
                                                        </p>
                                                    ))}
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {!showTranslation && (
                        <div className="flex justify-center pt-4">
                            <Button
                                size="lg"
                                onClick={() => setShowTranslation(true)}
                                className={`text-lg transition-opacity duration-300 ${showTranslation ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                Показать перевод
                            </Button>
                        </div>
                    )}
                    {showTranslation && (
                        <div className="flex justify-center pt-4">
                            <Button
                                size="lg"
                                onClick={handleNext}
                                className="gap-2"
                            >
                                {currentIndex < words.length - 1
                                    ? 'Следующее слово'
                                    : 'Завершить'}
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Stage1SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                settings={settings}
                onChange={handleSettingsChange}
            />
        </div>
    );
}
