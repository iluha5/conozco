'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useI18n } from '@/lib/i18n';
import { readGuestSettings, getLanguageById } from '@/lib/guest-settings';

export function GuestLanguageSync() {
    const { status } = useSession();
    const i18n = useI18n();

    useEffect(() => {
        if (status !== 'unauthenticated') {
            return;
        }

        const guestSettings = readGuestSettings();
        const interfaceLanguage = getLanguageById(
            guestSettings.interfaceLanguageId,
        );

        if (
            interfaceLanguage?.code &&
            interfaceLanguage.code !== i18n.language
        ) {
            void i18n.changeLanguage(interfaceLanguage.code);

            if (typeof document !== 'undefined') {
                document.documentElement.lang = interfaceLanguage.code;
            }
        }
    }, [status, i18n]);

    return null;
}
