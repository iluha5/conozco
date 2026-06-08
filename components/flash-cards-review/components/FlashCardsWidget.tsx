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

    // Update parameters when language changes
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
        // Reset loading flag on close so new words load on next open
        setShouldLoadExercise(false);
    };

    // Don't show widget if language not loaded yet
    if (!languageCode) {
        return null;
    }

    return (
        <>
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">🃏</span>
                        {t('Review learned words')}
                    </CardTitle>
                    <CardDescription>
                        {t(
                            'Quick check of 10 random learned words through flashcards',
                        )}
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
