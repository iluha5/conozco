'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect, useCallback, useMemo, useState } from 'react';
import {
    CookieConsent,
    CookieConsentRequest,
    CookieConsentResponse,
    LocalStorageConsent,
    CookiePreferences,
    COOKIE_CONSENT_VERSION,
    COOKIE_CONSENT_STORAGE_KEY,
} from '@/types/cookie-consent.types';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';

function loadFromLocalStorage(): LocalStorageConsent | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        const stored = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
        if (!stored) {
            return null;
        }
        return JSON.parse(stored) as LocalStorageConsent;
    } catch (error) {
        console.error('Error loading consent from localStorage:', error);
        return null;
    }
}

function saveToLocalStorage(consent: LocalStorageConsent): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.setItem(
            COOKIE_CONSENT_STORAGE_KEY,
            JSON.stringify(consent),
        );
    } catch (error) {
        console.error('Error saving consent to localStorage:', error);
    }
}

function _removeFromLocalStorage(): void {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    } catch (error) {
        console.error('Error removing consent from localStorage:', error);
    }
}

function responseToConsent(
    response: CookieConsentResponse | null,
): CookieConsent | null {
    if (!response) {
        return null;
    }

    return {
        id: response.id,
        userId: response.userId,
        version: response.version,
        given: response.given,
        givenAt: response.givenAt ? new Date(response.givenAt) : null,
        withdrawnAt: response.withdrawnAt
            ? new Date(response.withdrawnAt)
            : null,
        preferences: response.preferences,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
    };
}

function localStorageToConsent(
    localStorageConsent: LocalStorageConsent | null,
): CookieConsent | null {
    if (!localStorageConsent) {
        return null;
    }

    return {
        id: 0,
        userId: 0,
        version: localStorageConsent.version,
        given: localStorageConsent.given,
        givenAt: localStorageConsent.givenAt
            ? new Date(localStorageConsent.givenAt)
            : null,
        withdrawnAt: localStorageConsent.withdrawnAt
            ? new Date(localStorageConsent.withdrawnAt)
            : null,
        preferences: localStorageConsent.preferences,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

async function fetchCookieConsent(): Promise<CookieConsentResponse | null> {
    const response = await fetch('/api/user/cookie-consent');

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error('Failed to fetch cookie consent');
    }

    const data = await response.json();
    return data || null;
}

async function saveCookieConsent(
    request: CookieConsentRequest,
): Promise<CookieConsentResponse> {
    const response = await fetch('/api/user/cookie-consent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save cookie consent');
    }

    return response.json();
}

async function withdrawCookieConsent(): Promise<CookieConsentResponse> {
    const response = await fetch('/api/user/cookie-consent', {
        method: 'DELETE',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to withdraw cookie consent');
    }

    return response.json();
}

// For authenticated users the DB record is the source of truth; for guests it's localStorage.
export function useCookieConsent() {
    const { data: session, status: sessionStatus } = useSession();
    const queryClient = useQueryClient();
    const isAuthenticated = !!session?.user?.id;

    const {
        data: dbConsent = null,
        isLoading: loadingDb,
        refetch: refetchDb,
    } = useQuery({
        queryKey: ['cookie-consent'],
        queryFn: fetchCookieConsent,
        enabled: isAuthenticated && sessionStatus !== 'loading',
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
    });

    const saveMutation = useMutation({
        mutationFn: saveCookieConsent,
        onSuccess: updatedConsent => {
            queryClient.setQueryData(['cookie-consent'], updatedConsent);
            const localStorageConsent: LocalStorageConsent = {
                version: updatedConsent.version,
                given: updatedConsent.given,
                givenAt: updatedConsent.givenAt || new Date().toISOString(),
                withdrawnAt: updatedConsent.withdrawnAt || undefined,
                preferences: updatedConsent.preferences,
            };
            saveToLocalStorage(localStorageConsent);
        },
    });

    const withdrawMutation = useMutation({
        mutationFn: withdrawCookieConsent,
        onSuccess: updatedConsent => {
            queryClient.setQueryData(['cookie-consent'], updatedConsent);
            const localStorageConsent: LocalStorageConsent = {
                version: updatedConsent.version,
                given: false,
                givenAt: updatedConsent.givenAt || new Date().toISOString(),
                withdrawnAt:
                    updatedConsent.withdrawnAt || new Date().toISOString(),
                preferences: updatedConsent.preferences,
            };
            saveToLocalStorage(localStorageConsent);
        },
    });

    const getConsent = useCallback((): CookieConsent | null => {
        if (isAuthenticated) {
            return dbConsent ? responseToConsent(dbConsent) : null;
        }
        const localStorageConsent = loadFromLocalStorage();
        return localStorageToConsent(localStorageConsent);
    }, [isAuthenticated, dbConsent]);

    const saveConsent = useCallback(
        async (
            preferences: CookiePreferences,
            given: boolean = true,
        ): Promise<void> => {
            const request: CookieConsentRequest = {
                version: COOKIE_CONSENT_VERSION,
                given,
                preferences: {
                    ...preferences,
                    necessary: true,
                },
            };

            if (isAuthenticated) {
                await saveMutation.mutateAsync(request);
                const now = new Date().toISOString();
                const localStorageConsent: LocalStorageConsent = {
                    version: request.version,
                    given,
                    givenAt: given ? now : dbConsent?.givenAt || now,
                    withdrawnAt: given ? undefined : now,
                    preferences: request.preferences,
                };
                saveToLocalStorage(localStorageConsent);
            } else {
                const now = new Date().toISOString();
                const currentConsent = getConsent();
                const localStorageConsent: LocalStorageConsent = {
                    version: request.version,
                    given,
                    givenAt: given
                        ? now
                        : currentConsent?.givenAt?.toISOString() || now,
                    withdrawnAt: given ? undefined : now,
                    preferences: request.preferences,
                };
                saveToLocalStorage(localStorageConsent);
                setLocalStorageVersion(prev => prev + 1);
            }
        },
        [isAuthenticated, saveMutation, getConsent, dbConsent],
    );

    const withdrawConsent = useCallback(async (): Promise<void> => {
        if (isAuthenticated) {
            await withdrawMutation.mutateAsync();
            const localStorageConsent = loadFromLocalStorage();
            if (localStorageConsent) {
                const updated: LocalStorageConsent = {
                    ...localStorageConsent,
                    given: false,
                    withdrawnAt: new Date().toISOString(),
                };
                saveToLocalStorage(updated);
            }
        } else {
            const localStorageConsent = loadFromLocalStorage();
            if (localStorageConsent) {
                const updated: LocalStorageConsent = {
                    ...localStorageConsent,
                    given: false,
                    withdrawnAt: new Date().toISOString(),
                };
                saveToLocalStorage(updated);
                setLocalStorageVersion(prev => prev + 1);
            }
        }
    }, [isAuthenticated, withdrawMutation]);

    const canUseFunctional = useCallback((): boolean => {
        const consent = getConsent();
        return (
            consent?.given === true && consent.preferences.functional === true
        );
    }, [getConsent]);

    const canUseAnalytics = useCallback((): boolean => {
        const consent = getConsent();
        return (
            consent?.given === true && consent.preferences.analytics === true
        );
    }, [getConsent]);

    const canUseMarketing = useCallback((): boolean => {
        const consent = getConsent();
        return (
            consent?.given === true && consent.preferences.marketing === true
        );
    }, [getConsent]);

    const hasConsent = useCallback((): boolean => {
        const consent = getConsent();
        return consent?.given === true;
    }, [getConsent]);

    // Re-prompts a declined user only after 24h cool-down to avoid nagging.
    const needsConsent = useCallback((): boolean => {
        if (isAuthenticated && loadingDb) {
            return false;
        }

        const consent = getConsent();
        if (!consent) return true;
        if (consent.version !== COOKIE_CONSENT_VERSION) return true;
        if (consent.given) return false;

        if (!consent.given && consent.withdrawnAt) {
            const hoursSinceWithdrawal =
                (Date.now() - consent.withdrawnAt.getTime()) / (1000 * 60 * 60);
            return hoursSinceWithdrawal >= 24;
        }

        return !consent.given;
    }, [getConsent, isAuthenticated, loadingDb]);

    const [localStorageVersion, setLocalStorageVersion] = useState(0);

    useEffect(() => {
        if (typeof window === 'undefined' || isAuthenticated) {
            return;
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === COOKIE_CONSENT_STORAGE_KEY) {
                setLocalStorageVersion(prev => prev + 1);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isAuthenticated]);

    const memoizedConsent = useMemo(() => {
        return getConsent();
    }, [
        isAuthenticated,
        dbConsent?.id,
        dbConsent?.version,
        dbConsent?.given,
        dbConsent?.givenAt,
        dbConsent?.withdrawnAt,
        localStorageVersion,
    ]);

    return {
        consent: memoizedConsent,
        loading: loadingDb,
        saving: saveMutation.isPending,
        withdrawing: withdrawMutation.isPending,
        error:
            saveMutation.error?.message ||
            withdrawMutation.error?.message ||
            null,
        saveConsent,
        withdrawConsent,
        refetch: refetchDb,
        canUseFunctional,
        canUseAnalytics,
        canUseMarketing,
        hasConsent,
        needsConsent,
    };
}
