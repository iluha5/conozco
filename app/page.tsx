'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Header } from '@/components/Header';
import { Brain, HelpCircle, Languages } from 'lucide-react';
import { ContinueTrainingCard } from '@/components/training/common/ContinueTrainingCard';
import { NewTrainingConfirmationDialog } from '@/components/training/common/NewTrainingConfirmationDialog';
import { FlashCardsWidget } from '@/components/flash-cards-review/components/FlashCardsWidget';
import { FlashCardsGroupWidget } from '@/components/flash-cards-review/components/FlashCardsGroupWidget';
import { useTrainingStorage } from '@/hooks/training';
import { useHashDialog } from '@/hooks/shared';

export default function HomePage() {
    const router = useRouter();
    const { savedState, hasUnfinishedTraining, clearProgress } =
        useTrainingStorage();
    const { open: showNewTrainingDialog, setOpen: setShowNewTrainingDialog } =
        useHashDialog('new-training-confirm');
    const { open: showHelpDialog, setOpen: setShowHelpDialog } =
        useHashDialog('training-help');
    const [isContinueLoading, setIsContinueLoading] = useState(false);
    const [isStartLoading, setIsStartLoading] = useState(false);
    const [isWordsLoading, setIsWordsLoading] = useState(false);

    const handleContinueTraining = () => {
        setIsContinueLoading(true);
        router.push('/training');
    };

    const handleStartTraining = () => {
        if (hasUnfinishedTraining) {
            setShowNewTrainingDialog(true);
        } else {
            setIsStartLoading(true);
            router.push('/training/setup');
        }
    };

    const handleContinueExisting = () => {
        setShowNewTrainingDialog(false);
        setIsContinueLoading(true);
        router.push('/training');
    };

    const handleStartNew = () => {
        clearProgress();
        setShowNewTrainingDialog(false);
        setIsStartLoading(true);
        router.push('/training/setup');
    };

    const handleGoToWords = () => {
        setIsWordsLoading(true);
        router.push('/words');
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Flash Cards
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Изучайте иностранные слова эффективно и легко
                    </p>
                </div>

                {hasUnfinishedTraining && savedState && (
                    <div className="max-w-4xl mx-auto mb-8">
                        <ContinueTrainingCard
                            savedState={savedState}
                            onContinue={handleContinueTraining}
                            loading={isContinueLoading}
                        />
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
                    <FlashCardsWidget />
                    <FlashCardsGroupWidget />

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="relative">
                            <div className="flex items-start justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="w-6 h-6 text-purple-600" />
                                    Тренировка
                                </CardTitle>
                                <Dialog
                                    open={showHelpDialog}
                                    onOpenChange={setShowHelpDialog}
                                >
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:bg-purple-100"
                                        >
                                            <HelpCircle className="w-5 h-5 text-purple-600" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader className="pb-4">
                                            <DialogTitle>
                                                Этапы обучения
                                            </DialogTitle>
                                            <DialogDescription>
                                                6 этапов тренировки для
                                                эффективного запоминания слов
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            <Card className="p-3">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">
                                                        Этап 1
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <p className="text-xs text-gray-600">
                                                        Просмотр слова с
                                                        озвучкой и переводом
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="p-3">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">
                                                        Этап 2
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <p className="text-xs text-gray-600">
                                                        Выбор правильного
                                                        перевода из 4 вариантов
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="p-3">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">
                                                        Этап 3
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <p className="text-xs text-gray-600">
                                                        Сопоставление
                                                        иностранного и русского
                                                        слова
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="p-3">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">
                                                        Этап 4
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <p className="text-xs text-gray-600">
                                                        Составление слова из
                                                        букв
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="p-3">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">
                                                        Этап 5
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <p className="text-xs text-gray-600">
                                                        Написание слова по
                                                        памяти
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            <Card className="p-3">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">
                                                        Этап 6
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    <p className="text-xs text-gray-600">
                                                        Финальный тест на знание
                                                        слова
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <CardDescription>
                                Проходите 6 этапов обучения для эффективного
                                запоминания слов
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                size="lg"
                                variant="secondary"
                                onClick={handleStartTraining}
                                loading={isStartLoading}
                            >
                                Начать тренировку
                            </Button>
                        </CardContent>
                    </Card>

                    <NewTrainingConfirmationDialog
                        open={showNewTrainingDialog}
                        onOpenChange={setShowNewTrainingDialog}
                        onContinue={handleContinueExisting}
                        onStartNew={handleStartNew}
                        continueLoading={isContinueLoading}
                        startNewLoading={isStartLoading}
                    />

                    <Card className="hover:shadow-lg transition-shadow flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Languages className="w-6 h-6 text-blue-600" />
                                Управление словами
                            </CardTitle>
                            <CardDescription>
                                Добавляйте новые слова, просматривайте переводы
                                и управляйте своим словарем
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleGoToWords}
                                loading={isWordsLoading}
                            >
                                Перейти к словам
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-16 text-center">
                    <Card className="max-w-2xl mx-auto bg-white/50 backdrop-blur">
                        <CardHeader>
                            <CardTitle>Поддерживаемые языки</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center gap-8">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🇬🇧</div>
                                    <p className="font-semibold">Английский</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🇪🇸</div>
                                    <p className="font-semibold">Испанский</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
