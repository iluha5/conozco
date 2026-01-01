'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FlashCardsReview } from '../FlashCardsReview';
import { useHashDialog } from '@/hooks/shared';
import { useUserSettings } from '@/hooks/settings/use-user-settings';
import { FlashCardsReviewParams } from '../typing';
import { useTranslation } from '@/lib/i18n';

export function FlashCardsWidget() {
    const { t } = useTranslation();
    const { settings: userSettings } = useUserSettings();
    const { open, setOpen } = useHashDialog('flash-cards-review');
    const [shouldLoadExercise, setShouldLoadExercise] = useState(false);
    const [reviewParams, setReviewParams] = useState<FlashCardsReviewParams>({
        status: 'LEARNED',
        limit: 10,
        random: true,
    });

    const languageCode = userSettings?.learnLanguage?.code;

    // Обновляем параметры при изменении языка
    useEffect(() => {
        if (languageCode) {
            setReviewParams(prev => ({
                ...prev,
                languageCode,
            }));
        }
    }, [languageCode]);

    const handleStartReview = () => {
        const returnUrl =
            window.location.pathname +
            window.location.search +
            window.location.hash;
        setReviewParams(prev => ({
            ...prev,
            returnUrl,
        }));
        setShouldLoadExercise(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        // Сбрасываем флаг загрузки при закрытии, чтобы при следующем открытии загрузились новые слова
        setShouldLoadExercise(false);
    };

    // Не показываем виджет если язык еще не загружен
    if (!languageCode) {
        return null;
    }

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🃏</span>
                        Проверка изученных слов
                    </CardTitle>
                    <CardDescription>
                        Повторите изученные слова с помощью карточек
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full"
                        size="lg"
                        variant="secondary"
                        onClick={handleStartReview}
                    >
                        {t('Start review')}
                    </Button>
                </CardContent>
            </Card>

            {open && shouldLoadExercise && (
                <FlashCardsReview params={reviewParams} onClose={handleClose} />
            )}
        </>
    );
}
