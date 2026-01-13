'use client';

import { useState } from 'react';
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
import { GroupReviewSetupDialog } from './GroupReviewSetupDialog';

export function FlashCardsGroupWidget() {
    const { settings: userSettings } = useUserSettings();
    const { open: reviewOpen, setOpen: setReviewOpen } = useHashDialog(
        'flash-cards-group-review',
    );
    const { open: setupOpen, setOpen: setSetupOpen } = useHashDialog(
        'flash-cards-group-setup',
    );
    const [shouldLoadExercise, setShouldLoadExercise] = useState(false);
    const [reviewParams, setReviewParams] =
        useState<FlashCardsReviewParams | null>(null);

    const languageCode = userSettings?.learnLanguage?.code;

    const handleStartSetup = () => {
        setSetupOpen(true);
    };

    const handleStartReview = (params: FlashCardsReviewParams) => {
        const returnUrl =
            window.location.pathname +
            window.location.search +
            window.location.hash;
        const finalParams = {
            ...params,
            languageCode: languageCode || params.languageCode,
            returnUrl,
        };
        setReviewParams(finalParams);
        setShouldLoadExercise(true);
        // First close setup dialog
        setSetupOpen(false);
        // Then open review dialog with small delay
        // to avoid conflict with window.history.back() from useHashDialog
        setTimeout(() => {
            setReviewOpen(true);
        }, 150);
    };

    const handleClose = () => {
        setReviewOpen(false);
        // Reset loading flag on close so new words load on next open
        setShouldLoadExercise(false);
        setReviewParams(null);
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
                        <span className="text-2xl">📚</span>
                        Проверка по группам слов
                    </CardTitle>
                    <CardDescription>
                        Проверьте слова из выбранной группы слов
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        className="w-full"
                        size="lg"
                        variant="secondary"
                        onClick={handleStartSetup}
                    >
                        Начать проверку
                    </Button>
                </CardContent>
            </Card>

            <GroupReviewSetupDialog
                open={setupOpen}
                onOpenChange={setSetupOpen}
                onStart={handleStartReview}
            />

            {reviewOpen &&
                shouldLoadExercise &&
                reviewParams &&
                languageCode && (
                    <FlashCardsReview
                        params={reviewParams}
                        onClose={handleClose}
                    />
                )}
        </>
    );
}
