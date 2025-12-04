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
import { useQuery } from '@tanstack/react-query';
import { FlashCardsReviewParams } from '../typing';
import { Loader2 } from 'lucide-react';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';

/**
 * Проверка наличия изученных слов
 */
async function checkLearnedWords(
    languageCode?: string,
): Promise<{ hasWords: boolean; count: number }> {
    const searchParams = new URLSearchParams();
    searchParams.append('status', 'LEARNED');
    searchParams.append('limit', '1');
    searchParams.append('random', 'false');

    if (languageCode) {
        searchParams.append('languageCode', languageCode);
    }

    const response = await fetch(
        `/api/words/review?${searchParams.toString()}`,
    );

    if (!response.ok) {
        return { hasWords: false, count: 0 };
    }

    const words = await response.json();
    return {
        hasWords: words.length > 0,
        count: words.length,
    };
}

export function FlashCardsWidget() {
    const { settings: userSettings } = useUserSettings();
    const { open, setOpen } = useHashDialog('flash-cards-review');
    const [reviewParams, setReviewParams] = useState<FlashCardsReviewParams>({
        status: 'LEARNED',
        limit: 10,
        random: true,
    });

    const languageCode = userSettings?.learnLanguage?.code;

    // Проверяем наличие изученных слов
    const { data: wordsCheck, isLoading } = useQuery({
        queryKey: ['flash-cards-check', languageCode],
        queryFn: () => checkLearnedWords(languageCode),
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
        enabled: !!languageCode,
    });

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
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // Не показываем виджет если еще загружаемся
    if (isLoading) {
        return (
            <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Проверка изученных слов
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    // Не показываем виджет если нет изученных слов
    if (!wordsCheck?.hasWords) {
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
                        Начать проверку
                    </Button>
                </CardContent>
            </Card>

            {open && (
                <FlashCardsReview params={reviewParams} onClose={handleClose} />
            )}
        </>
    );
}
