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

export function GoogleAnalytics() {
    const { canUseAnalytics } = useCookieConsent();
    const pathname = usePathname();

    useEffect(() => {
        if (!GA_MEASUREMENT_ID) {
            return;
        }

        if (canUseAnalytics()) {
            initGoogleAnalytics(GA_MEASUREMENT_ID);
        } else {
            disableGoogleAnalytics();
        }
    }, [canUseAnalytics]);

    useEffect(() => {
        if (canUseAnalytics() && pathname) {
            trackPageView(pathname);
        }
    }, [pathname, canUseAnalytics]);

    return null;
}
