'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useCookieConsent } from '@/hooks/shared/useCookieConsent';
import {
    initGoogleAnalytics,
    trackPageView,
    disableGoogleAnalytics,
} from '@/lib/analytics/google-analytics';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

/**
 * Компонент для условной загрузки Google Analytics
 * Загружает GA только при согласии пользователя на аналитические куки
 */
export function GoogleAnalytics() {
    const { canUseAnalytics } = useCookieConsent();
    const pathname = usePathname();

    useEffect(() => {
        if (!GA_MEASUREMENT_ID) {
            // GA не настроен, ничего не делаем
            return;
        }

        if (canUseAnalytics()) {
            // Пользователь дал согласие - инициализируем GA
            initGoogleAnalytics(GA_MEASUREMENT_ID);
        } else {
            // Пользователь не дал согласие или отозвал его - отключаем GA
            disableGoogleAnalytics();
        }
    }, [canUseAnalytics]);

    // Отслеживаем изменения пути страницы
    useEffect(() => {
        if (canUseAnalytics() && pathname) {
            trackPageView(pathname);
        }
    }, [pathname, canUseAnalytics]);

    // Компонент не рендерит ничего видимого
    return null;
}
