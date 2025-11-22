'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, ChevronRight, Settings } from 'lucide-react';
import { ProgressDots } from './ProgressDots';
import { Stage1SettingsModal } from './Stage1SettingsModal';
import { useStage1Settings } from '@/hooks/shared/use-training-settings';
import {
    useFadeAnimation,
    useRecordResult,
    useExerciseResults,
    useSpeech,
} from '@/hooks/training';
import { getWordText, getWordTranslation } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

type Stage1Props = {
    words: Word[];
    onComplete: () => void;
};

export function Stage1Training({ words, onComplete }: Stage1Props) {
    const { settings, updateSettings } = useStage1Settings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const currentWord = words[currentIndex];

    // Используем новые хуки
    const { fadeIn, animationKey, triggerAnimation } = useFadeAnimation();
    const { exerciseResults, updateResult } = useExerciseResults({
        totalExercises: words.length,
    });
    const { recordResult } = useRecordResult();
    const { speak, isSupported: speechSupported } = useSpeech({
        languageCode: currentWord?.language.code || 'en',
    });

    // Обработчик изменения настроек
    const handleSettingsChange = (newSettings: { showExamples: boolean }) => {
        updateSettings(newSettings);
        setShowSettingsModal(false);
    };

    // Автоматическая озвучка и анимация при появлении нового слова
    useEffect(() => {
        if (currentWord) {
            triggerAnimation();
            setShowTranslation(false);

            // Озвучиваем слово
            const wordText = getWordText(currentWord);
            if (speechSupported && wordText) {
                speak(wordText);
            }
        }
    }, [currentIndex, currentWord, triggerAnimation, speak, speechSupported]);

    const handleNext = async () => {
        // Записываем результат (всегда успешный на 1 этапе - просто просмотр)
        await recordResult(1, currentWord.id, true);

        // Обновляем результаты упражнения
        updateResult(currentIndex, true);

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
                                {getWordText(currentWord)}
                            </h2>
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => speak(getWordText(currentWord))}
                                className="rounded-full w-12 h-12"
                                disabled={!speechSupported}
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
                                        {getWordTranslation(currentWord)}
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
