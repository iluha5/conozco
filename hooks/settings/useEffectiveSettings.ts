'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    readGuestSettings,
    writeGuestSettings,
    getLanguageById,
    GuestSettings,
} from '@/lib/guest-settings';
import {
    useUserSettings,
    UserSettings,
    UpdateUserSettings,
} from './use-user-settings';

function guestSettingsToUserSettings(
    guestSettings: GuestSettings,
): UserSettings {
    const ownLanguage = getLanguageById(guestSettings.ownLanguageId) ?? null;
    const learnLanguage =
        getLanguageById(guestSettings.learnLanguageId) ?? null;
    const interfaceLanguage =
        getLanguageById(guestSettings.interfaceLanguageId) ?? null;

    return {
        id: 0,
        email: '',
        name: null,
        ownLanguageId: guestSettings.ownLanguageId,
        learnLanguageId: guestSettings.learnLanguageId,
        interfaceLanguageId: guestSettings.interfaceLanguageId,
        hasConfigured: true,
        ownLanguage,
        learnLanguage,
        interfaceLanguage,
    };
}

export function useEffectiveSettings() {
    const { status } = useSession();
    const isGuest = status === 'unauthenticated';
    const isAuthenticated = status === 'authenticated';

    const authSettings = useUserSettings();
    const [guestSettings, setGuestSettings] = useState<GuestSettings | null>(
        null,
    );
    const [guestInitialized, setGuestInitialized] = useState(false);

    useEffect(() => {
        if (isGuest) {
            setGuestSettings(readGuestSettings());
            setGuestInitialized(true);
        }
    }, [isGuest]);

    const settings = useMemo(() => {
        if (isAuthenticated) {
            return authSettings.settings;
        }

        if (guestSettings) {
            return guestSettingsToUserSettings(guestSettings);
        }

        return null;
    }, [isAuthenticated, authSettings.settings, guestSettings]);

    const loading = isAuthenticated ? authSettings.loading : !guestInitialized;

    const updateSettings = useCallback(
        async (updates: UpdateUserSettings) => {
            if (isAuthenticated) {
                return authSettings.updateSettings(updates);
            }

            const current = guestSettings ?? readGuestSettings();
            const next: GuestSettings = {
                ownLanguageId: updates.ownLanguageId ?? current.ownLanguageId,
                learnLanguageId:
                    updates.learnLanguageId ?? current.learnLanguageId,
                interfaceLanguageId:
                    updates.interfaceLanguageId ?? current.interfaceLanguageId,
            };

            writeGuestSettings(next);
            setGuestSettings(next);

            return guestSettingsToUserSettings(next);
        },
        [isAuthenticated, authSettings, guestSettings],
    );

    return {
        settings,
        loading,
        saving: isAuthenticated ? authSettings.saving : false,
        error: isAuthenticated ? authSettings.error : null,
        refetch: authSettings.refetch,
        updateSettings,
        isGuest,
        isAuthenticated,
    };
}
