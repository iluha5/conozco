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

/**
 * Загрузить согласие из localStorage
 */
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

/**
 * Сохранить согласие в localStorage
 */
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

/**
 * Удалить согласие из localStorage
 */
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

/**
 * Преобразовать CookieConsentResponse в CookieConsent
 */
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

/**
 * Преобразовать LocalStorageConsent в CookieConsent (для неавторизованных)
 */
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

/**
 * Загрузить согласие из API (для авторизованных пользователей)
 */
async function fetchCookieConsent(): Promise<CookieConsentResponse | null> {
    const response = await fetch('/api/user/cookie-consent');

    if (response.status === 401) {
        // User not authorized
        return null;
    }

    if (!response.ok) {
        throw new Error('Failed to fetch cookie consent');
    }

    const data = await response.json();
    return data || null;
}

/**
 * Сохранить согласие через API
 */
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

/**
 * Отозвать согласие через API
 */
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

/**
 * Хук для работы с согласием на использование куки
 * Поддерживает работу для авторизованных и неавторизованных пользователей
 */
export function useCookieConsent() {
    const { data: session, status: sessionStatus } = useSession();
    const queryClient = useQueryClient();
    const isAuthenticated = !!session?.user?.id;

    // Load consent from DB for authorized users
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

    // Mutation for saving consent
    const saveMutation = useMutation({
        mutationFn: saveCookieConsent,
        onSuccess: updatedConsent => {
            queryClient.setQueryData(['cookie-consent'], updatedConsent);
            // Save to localStorage only for caching (DB is source of truth for registered)
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

    // Mutation for withdrawing consent
    const withdrawMutation = useMutation({
        mutationFn: withdrawCookieConsent,
        onSuccess: updatedConsent => {
            queryClient.setQueryData(['cookie-consent'], updatedConsent);
            // Save to localStorage for fast access (but DB is source of truth)
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

    // Get current consent
    // For registered users - DB is source of truth
    // For unregistered - localStorage is source of truth
    const getConsent = useCallback((): CookieConsent | null => {
        // For registered users - use DB as source of truth
        if (isAuthenticated) {
            if (dbConsent) {
                return responseToConsent(dbConsent);
            }
            // If no data in DB - return null (banner will be shown)
            return null;
        }

        // For unregistered users - use localStorage as source of truth
        const localStorageConsent = loadFromLocalStorage();
        return localStorageToConsent(localStorageConsent);
    }, [isAuthenticated, dbConsent]);

    // Save consent
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
                    necessary: true, // always true
                },
            };

            if (isAuthenticated) {
                // For registered users - save only to DB (source of truth)
                await saveMutation.mutateAsync(request);
                // Also save to localStorage for fast access (but DB is source of truth)
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
                // For unregistered users - save only to localStorage (source of truth)
                const now = new Date().toISOString();
                const currentConsent = getConsent();
                const localStorageConsent: LocalStorageConsent = {
                    version: request.version,
                    given,
                    givenAt: given
                        ? now
                        : currentConsent?.givenAt?.toISOString() || now,
                    withdrawnAt: given ? undefined : now, // Save withdrawal time if given: false
                    preferences: request.preferences,
                };
                saveToLocalStorage(localStorageConsent);
                setLocalStorageVersion(prev => prev + 1);
            }
        },
        [isAuthenticated, saveMutation, getConsent, dbConsent],
    );

    // Withdraw consent
    const withdrawConsent = useCallback(async (): Promise<void> => {
        if (isAuthenticated) {
            // For registered users - update DB (source of truth)
            await withdrawMutation.mutateAsync();
            // Also update localStorage for fast access
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
            // For unregistered users - update localStorage (source of truth)
            const localStorageConsent = loadFromLocalStorage();
            if (localStorageConsent) {
                const updated: LocalStorageConsent = {
                    ...localStorageConsent,
                    given: false,
                    withdrawnAt: new Date().toISOString(), // Save withdrawal time
                };
                saveToLocalStorage(updated);
                setLocalStorageVersion(prev => prev + 1);
            }
        }
    }, [isAuthenticated, withdrawMutation]);

    // Removed sync on auth - DB is source of truth for registered users
    // If user first gave consent as unregistered, then registered,
    // they will see banner again and can give consent as registered user

    // Consent type checking
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

    const needsConsent = useCallback((): boolean => {
        // For registered users - wait for DB data loading
        if (isAuthenticated && loadingDb) {
            return false; // Don't show until DB data loaded
        }

        // For unregistered users - localStorage data available immediately
        const consent = getConsent();

        // If no consent - show banner
        if (!consent) {
            return true;
        }

        // Check policy version
        if (consent.version !== COOKIE_CONSENT_VERSION) {
            return true;
        }

        // If consent given - don't show popup
        if (consent.given) {
            return false;
        }

        // If consent not given (declined), check time by withdrawnAt
        // If less than 24 hours passed since decline - don't show popup
        if (!consent.given && consent.withdrawnAt) {
            const hoursSinceWithdrawal =
                (Date.now() - consent.withdrawnAt.getTime()) / (1000 * 60 * 60);
            if (hoursSinceWithdrawal < 24) {
                return false; // Less than 24 hours passed - don't show
            }
            // 24 hours or more passed - show popup again
            return true;
        }

        // If no withdrawal time info but given: false - show popup
        return !consent.given;
    }, [getConsent, isAuthenticated, loadingDb]);

    // State for tracking localStorage changes (for unauthorized users)
    const [localStorageVersion, setLocalStorageVersion] = useState(0);

    // Track localStorage changes via storage event
    useEffect(() => {
        if (typeof window === 'undefined' || isAuthenticated) {
            return;
        }

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === COOKIE_CONSENT_STORAGE_KEY) {
                setLocalStorageVersion(prev => prev + 1);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isAuthenticated]);

    // Memoize consent to avoid creating new object on every render
    // Use key fields for stable comparison
    const memoizedConsent = useMemo(() => {
        return getConsent();
    }, [
        isAuthenticated,
        // Use primitive values for stable comparison
        dbConsent?.id,
        dbConsent?.version,
        dbConsent?.given,
        dbConsent?.givenAt,
        dbConsent?.withdrawnAt,
        // For unauthorized users track changes via version
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
