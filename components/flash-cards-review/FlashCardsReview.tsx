'use client';

import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
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
    const queryClient = useQueryClient();
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

    // Invalidate word counters on test completion or closure
    const invalidateWordCounters = useCallback(() => {
        const languageCode = userSettings?.learnLanguage?.code || null;
        if (languageCode) {
            queryClient.invalidateQueries({
                queryKey: ['training-list-words', languageCode],
            });
        }
    }, [queryClient, userSettings?.learnLanguage?.code]);

    const handleClose = () => {
        // Invalidate counters on close
        invalidateWordCounters();
        if (params.returnUrl) {
            router.push(params.returnUrl);
        }
        onClose();
    };

    // Invalidate counters on test completion
    useEffect(() => {
        if (isCompleted) {
            invalidateWordCounters();
        }
    }, [invalidateWordCounters, isCompleted]);

    // Block body scroll when opening modal
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
                            <p className="text-gray-600">
                                {t('Loading words...')}
                            </p>
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
                                {t('Error loading words. Try again.')}
                            </p>
                            <Button onClick={handleClose}>{t('Close')}</Button>
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
                                {t('No words to check')}
                            </p>
                            <Button onClick={handleClose}>{t('Close')}</Button>
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
                                {t('Training completed!')}
                            </h2>
                            <div className="w-full space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        {t('Total:')}
                                    </span>
                                    <span className="font-semibold">
                                        {stats.total}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-600">
                                        {t('Know:')}
                                    </span>
                                    <span className="font-semibold text-green-600">
                                        {stats.known}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-red-600">
                                        {t("Don't know:")}
                                    </span>
                                    <span className="font-semibold text-red-600">
                                        {stats.dontKnow}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-orange-600">
                                        {t('Removed/Skipped:')}
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
                                {t('Close')}
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
                                    ? t('Card {{current}} of {{total}}', {
                                          current: currentIndex + 1,
                                          total: totalWords,
                                      })
                                    : t(
                                          'Completed: {{completed}} of {{total}}',
                                          {
                                              completed: totalWords,
                                              total: totalWords,
                                          },
                                      )}
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

    // Render through Portal directly to body to avoid parent style influence
    if (typeof window === 'undefined') {
        return null;
    }

    return createPortal(renderContent(), document.body);
}
