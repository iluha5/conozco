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
        const finalParams = {
            ...params,
            languageCode: languageCode || params.languageCode,
        };
        setReviewParams(finalParams);
        setShouldLoadExercise(true);
        // Сначала закрываем setup диалог
        setSetupOpen(false);
        // Затем открываем review диалог с небольшой задержкой
        // чтобы избежать конфликта с window.history.back() из useHashDialog
        setTimeout(() => {
            setReviewOpen(true);
        }, 150);
    };

    const handleClose = () => {
        setReviewOpen(false);
        // Сбрасываем флаг загрузки при закрытии, чтобы при следующем открытии загрузились новые слова
        setShouldLoadExercise(false);
        setReviewParams(null);
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
