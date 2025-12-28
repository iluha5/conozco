'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Loader2 } from 'lucide-react';
import { FlashCard, FlashCardDeleteButton } from './components/FlashCard';
import { FlashCardActions } from './components/FlashCardActions';
import { useFlashCardsReview } from './hooks/useFlashCardsReview';
import { FlashCardsReviewParams } from './typing';
import { useUserSettings } from '@/hooks/settings/use-user-settings';
import { useTranslation } from '@/lib/i18n';

interface FlashCardsReviewProps {
    params: FlashCardsReviewParams;
    onClose: () => void;
}

export function FlashCardsReview({ params, onClose }: FlashCardsReviewProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const { settings: userSettings } = useUserSettings();
    const {
        currentWord,
        currentIndex,
        totalWords,
        isLoading,
        error,
        isCompleted,
        stats,
        progress,
        handleAction,
    } = useFlashCardsReview(params, true);

    const learnLanguageCode = userSettings?.learnLanguage?.code || 'en';
    const ownLanguageCode = userSettings?.ownLanguage?.code || 'ru';

    const handleClose = () => {
        if (params.returnUrl) {
            router.push(params.returnUrl);
        }
        onClose();
    };

    // Блокируем прокрутку body при открытии модального окна
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="p-8">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                            <p className="text-gray-600">Загрузка слов...</p>
                        </div>
                    </Card>
                </div>
            );
        }

        if (error) {
            return (
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="p-8 max-w-md">
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-red-600">
                                Ошибка загрузки слов. Попробуйте еще раз.
                            </p>
                            <Button onClick={handleClose}>Закрыть</Button>
                        </div>
                    </Card>
                </div>
            );
        }

        if (totalWords === 0) {
            return (
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="p-8 max-w-md">
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-gray-600">
                                Нет слов для проверки
                            </p>
                            <Button onClick={handleClose}>Закрыть</Button>
                        </div>
                    </Card>
                </div>
            );
        }

        if (isCompleted) {
            return (
                <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="p-8 max-w-md">
                        <div className="flex flex-col items-center gap-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Тренировка завершена!
                            </h2>
                            <div className="w-full space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        Всего:
                                    </span>
                                    <span className="font-semibold">
                                        {stats.total}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-600">
                                        Знаю:
                                    </span>
                                    <span className="font-semibold text-green-600">
                                        {stats.known}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-red-600">
                                        Не знаю:
                                    </span>
                                    <span className="font-semibold text-red-600">
                                        {stats.dontKnow}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-orange-600">
                                        Удалено/Пропущено:
                                    </span>
                                    <span className="font-semibold text-orange-600">
                                        {stats.deleted}
                                    </span>
                                </div>
                            </div>
                            <Button
                                onClick={handleClose}
                                size="lg"
                                className="w-full"
                            >
                                Закрыть
                            </Button>
                        </div>
                    </Card>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 m-0 bg-gradient-to-br from-purple-50 to-pink-100 z-50 overflow-y-auto">
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    {/* Заголовок */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {params.selectedGroupName
                                    ? t('Review: {{name}}', {
                                          name: params.selectedGroupName,
                                      })
                                    : t('Review learned words')}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {currentWord
                                    ? `Карточка ${currentIndex + 1} из ${totalWords}`
                                    : `Завершено: ${totalWords} из ${totalWords}`}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-10 w-10"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Прогресс бар */}
                    <div className="mb-6">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Карточка */}
                    {currentWord && !isCompleted && (
                        <div className="mb-6">
                            <div className="h-[400px] md:h-[500px] relative">
                                <FlashCard
                                    word={currentWord}
                                    onAction={handleAction}
                                    learnLanguageCode={learnLanguageCode}
                                    ownLanguageCode={ownLanguageCode}
                                />
                            </div>
                            {/* Кнопка удаления/пропуска для мобильной версии */}
                            <FlashCardDeleteButton
                                onAction={() =>
                                    handleAction(
                                        currentWord.belongsToUser
                                            ? 'delete'
                                            : 'skip',
                                    )
                                }
                                disabled={!currentWord}
                                belongsToUser={
                                    currentWord?.belongsToUser ?? true
                                }
                            />
                        </div>
                    )}

                    {/* Кнопки действий (только на десктопе) */}
                    <div className="hidden md:block">
                        <FlashCardActions
                            onAction={handleAction}
                            disabled={!currentWord}
                            belongsToUser={currentWord?.belongsToUser ?? true}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Рендерим через Portal напрямую в body для избежания влияния родительских стилей
    if (typeof window === 'undefined') {
        return null;
    }

    return createPortal(renderContent(), document.body);
}
