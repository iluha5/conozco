'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Header } from '@/components/header';
import { ArrowLeft } from 'lucide-react';
import { Stage1Training } from '@/components/training/stage1';
import { Stage2Training } from '@/components/training/stage2';
import { Stage3Training } from '@/components/training/stage3';
import { Stage4Training } from '@/components/training/stage4';
import { Stage5Training } from '@/components/training/stage5';
import { Stage6Training } from '@/components/training/stage6';
import { WordsList } from '@/components/words-list';
import { useToast } from '@/hooks/use-toast';
import {
    useTrainingSettings,
    useTrainingSelection,
} from '@/hooks/use-training-settings';
import { useTrainingWords } from '@/contexts/training-words-context';

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
    trainingSessions: Array<{
        id: string;
        stage: number;
        isCorrect: boolean;
        createdAt: string;
    }>;
};

export default function TrainingPage() {
    const { settings: trainingSettings, isLoaded: settingsLoaded } =
        useTrainingSettings();
    const { selectedLanguage, isLoaded: selectionLoaded } =
        useTrainingSelection();
    const { selectedWords } = useTrainingWords();
    const [words, setWords] = useState<Word[]>([]);
    const [currentStage, setCurrentStage] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [trainingWords, setTrainingWords] = useState<Word[]>([]);
    const [trainingCompleted, setTrainingCompleted] = useState(false);
    const [completedWords, setCompletedWords] = useState<Word[]>([]);
    const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
    const { toast } = useToast();

    const enabledStages = useMemo(
        () =>
            trainingSettings
                ? new Set(trainingSettings.enabledStages)
                : new Set([1, 2, 3, 4, 5, 6]),
        [trainingSettings],
    );

    const fetchWords = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/words?status=NOT_LEARNED');
            if (response.ok) {
                const data = await response.json();
                setWords(data);
            }
        } catch (error) {
            console.error('Error fetching words:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить слова',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const isStageEnabled = useCallback(
        (stage: number) => enabledStages.has(stage),
        [enabledStages],
    );

    const filterTrainingWords = useCallback(() => {
        let filtered = words.filter(w => w.status === 'NOT_LEARNED');

        if (selectedLanguage !== 'ALL') {
            filtered = filtered.filter(
                word => word.language.code === selectedLanguage,
            );
        }

        // Фильтруем по выбранным словам
        if (selectedWords.size > 0) {
            filtered = filtered.filter(word => selectedWords.has(word.id));
        }

        setTrainingWords(filtered);
    }, [words, selectedLanguage, selectedWords]);

    useEffect(() => {
        if (settingsLoaded && selectionLoaded) {
            fetchWords();
        }
    }, [settingsLoaded, selectionLoaded, fetchWords]);

    useEffect(() => {
        filterTrainingWords();
    }, [words, selectedLanguage, selectedWords, filterTrainingWords]);

    useEffect(() => {
        // Если текущий этап отключен, переключаемся на первый доступный
        if (!isStageEnabled(currentStage)) {
            const firstEnabled = Array.from(enabledStages).sort()[0];
            if (firstEnabled) {
                setCurrentStage(firstEnabled);
            }
        }
    }, [enabledStages, currentStage, isStageEnabled]);

    const handleStageComplete = async () => {
        const enabledStagesArray = Array.from(enabledStages).sort();
        const currentIndex = enabledStagesArray.indexOf(currentStage);

        if (currentIndex < enabledStagesArray.length - 1) {
            // Есть следующий этап - переключаемся на него
            const nextStage = enabledStagesArray[currentIndex + 1];
            setCurrentStage(nextStage);
        } else {
            // Это последний этап - завершаем тренировку и отмечаем слова как выученные
            // Отмечаем все слова как выученные
            try {
                for (const word of trainingWords) {
                    await fetch(`/api/words/${word.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ status: 'LEARNED' }),
                    });
                }

                // Обновляем список слов для отображения
                const response = await fetch('/api/words');
                if (response.ok) {
                    const allWords = await response.json();
                    // Фильтруем только те слова которые были в тренировке
                    const trainedWordIds = trainingWords.map(w => w.id);
                    const learnedWords = allWords.filter((w: Word) =>
                        trainedWordIds.includes(w.id),
                    );
                    setCompletedWords(learnedWords);

                    // Показываем зеленый toast с результатами
                    toast({
                        description: `Выучено слов: ${learnedWords.length}`,
                        variant: 'success',
                    });
                }

                setTrainingCompleted(true);
            } catch (error) {
                console.error('Error marking words as learned:', error);
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось отметить слова как выученные',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleReloadWords = async () => {
        const response = await fetch('/api/words');
        if (response.ok) {
            const allWords = await response.json();
            const trainedWordIds = trainingWords.map(w => w.id);
            const learnedWords = allWords.filter((w: Word) =>
                trainedWordIds.includes(w.id),
            );
            setCompletedWords(learnedWords);
        }
    };

    const handleStartNewTraining = () => {
        setTrainingCompleted(false);
        setCompletedWords([]);
        window.location.href = '/training/setup';
    };

    const handleConfirmExit = () => {
        setIsExitDialogOpen(false);
        window.location.href = '/';
    };

    const renderTrainingScreen = () => (
        <>
            <div className="mb-8 flex items-center justify-between gap-4">
                <h1 className="text-4xl font-bold text-gray-900 truncate">
                    Тренировка
                </h1>
                <Button
                    variant="outline"
                    onClick={() => setIsExitDialogOpen(true)}
                    className="flex-shrink-0"
                >
                    Завершить
                </Button>
            </div>

            <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
                <DialogContent className="!left-4 !right-4 !translate-x-0 !w-auto sm:!left-[50%] sm:!right-auto sm:!translate-x-[-50%] sm:!w-full">
                    <DialogHeader>
                        <DialogTitle>Завершить тренировку?</DialogTitle>
                        <DialogDescription>
                            Результаты текущей тренировки будут сброшены.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsExitDialogOpen(false)}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmExit}
                        >
                            Завершить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="mb-6 overflow-x-auto py-2">
                <div className="flex gap-2 md:gap-4 justify-center min-w-max px-4">
                    {Array.from(enabledStages)
                        .sort()
                        .map((stage, index) => (
                            <Card
                                key={stage}
                                className={`cursor-pointer transition-all aspect-square flex flex-col justify-center w-[50px] md:w-[120px] flex-shrink-0 ${
                                    currentStage === stage
                                        ? 'ring-2 ring-purple-600 bg-purple-50'
                                        : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setCurrentStage(stage)}
                            >
                                <CardHeader className="flex-1 flex items-center justify-center p-1 md:p-6">
                                    <CardTitle className="text-center">
                                        <span className="md:hidden text-xl font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="hidden md:inline text-sm">
                                            Этап {index + 1}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 hidden md:block">
                                    <p className="text-xs text-center text-gray-600">
                                        {stage === 1 && 'Просмотр + озвучка'}
                                        {stage === 2 && 'Выбор перевода'}
                                        {stage === 3 && 'Сопоставление'}
                                        {stage === 4 && 'Составление слова'}
                                        {stage === 5 &&
                                            'Составление предложения'}
                                        {stage === 6 && 'Составление по голосу'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Загрузка...</p>
                </div>
            ) : (
                renderStage()
            )}
        </>
    );

    const renderStage = () => {
        if (trainingWords.length === 0) {
            return (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-600">
                            Нет слов для тренировки. Добавьте слова в словарь!
                        </p>
                        <div className="flex justify-center mt-4">
                            <Link href="/words">
                                <Button>Перейти к словам</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (!isStageEnabled(currentStage)) {
            return (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-gray-600">
                            Этап {currentStage} отключен в настройках.
                        </p>
                    </CardContent>
                </Card>
            );
        }

        switch (currentStage) {
            case 1:
                return (
                    <Stage1Training
                        words={trainingWords}
                        onComplete={handleStageComplete}
                    />
                );
            case 2:
                return (
                    <Stage2Training
                        words={trainingWords}
                        onComplete={handleStageComplete}
                    />
                );
            case 3:
                return (
                    <Stage3Training
                        words={trainingWords}
                        onComplete={handleStageComplete}
                    />
                );
            case 4:
                return (
                    <Stage4Training
                        words={trainingWords}
                        onComplete={handleStageComplete}
                    />
                );
            case 5:
                return (
                    <Stage5Training
                        words={trainingWords}
                        onComplete={handleStageComplete}
                    />
                );
            case 6:
                return (
                    <Stage6Training
                        words={trainingWords}
                        onComplete={handleStageComplete}
                    />
                );
            default:
                return null;
        }
    };

    const renderResultsScreen = () => (
        <>
            <div className="mb-6 flex items-center justify-between">
                <Link href="/">
                    <Button variant="ghost">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Главная
                    </Button>
                </Link>
                <Button onClick={handleStartNewTraining}>
                    Новая тренировка
                </Button>
            </div>

            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    🎉 Тренировка завершена!
                </h1>
                <p className="text-md text-gray-600">
                    Все слова отмечены как выученные. Вы можете изменить их
                    статус ниже.
                </p>
            </div>

            <WordsList
                words={completedWords}
                onWordsChange={handleReloadWords}
                showBulkActions={true}
                emptyMessage="Слова не найдены"
            />
        </>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <Header />
            <div className="container mx-auto px-4 py-8">
                {trainingCompleted
                    ? renderResultsScreen()
                    : renderTrainingScreen()}
            </div>
        </div>
    );
}
