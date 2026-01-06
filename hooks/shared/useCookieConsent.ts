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
function removeFromLocalStorage(): void {
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
        // Пользователь не авторизован
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
        throw new Error(
            errorData.error || 'Failed to withdraw cookie consent',
        );
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

    // Загрузка согласия из БД для авторизованных пользователей
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

    // Мутация для сохранения согласия
    const saveMutation = useMutation({
        mutationFn: saveCookieConsent,
        onSuccess: (updatedConsent) => {
            queryClient.setQueryData(['cookie-consent'], updatedConsent);
            // Сохраняем в localStorage только для кэширования (БД - источник правды для зарегистрированных)
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

    // Мутация для отзыва согласия
    const withdrawMutation = useMutation({
        mutationFn: withdrawCookieConsent,
        onSuccess: (updatedConsent) => {
            queryClient.setQueryData(['cookie-consent'], updatedConsent);
            // Сохраняем в localStorage для быстрого доступа (но БД - источник правды)
            const localStorageConsent: LocalStorageConsent = {
                version: updatedConsent.version,
                given: false,
                givenAt: updatedConsent.givenAt || new Date().toISOString(),
                withdrawnAt: updatedConsent.withdrawnAt || new Date().toISOString(),
                preferences: updatedConsent.preferences,
            };
            saveToLocalStorage(localStorageConsent);
        },
    });

    // Получить текущее согласие
    // Для зарегистрированных пользователей - источник правды БД
    // Для незарегистрированных - источник правды localStorage
    const getConsent = useCallback((): CookieConsent | null => {
        // Для зарегистрированных пользователей - используем БД как источник правды
        if (isAuthenticated) {
            if (dbConsent) {
                return responseToConsent(dbConsent);
            }
            // Если данных в БД нет - возвращаем null (будет показан баннер)
            return null;
        }

        // Для незарегистрированных пользователей - используем localStorage как источник правды
        const localStorageConsent = loadFromLocalStorage();
        return localStorageToConsent(localStorageConsent);
    }, [isAuthenticated, dbConsent]);

    // Сохранить согласие
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
                    necessary: true, // всегда true
                },
            };

            if (isAuthenticated) {
                // Для зарегистрированных пользователей - сохраняем только в БД (источник правды)
                await saveMutation.mutateAsync(request);
                // Также сохраняем в localStorage для быстрого доступа (но БД - источник правды)
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
                // Для незарегистрированных пользователей - сохраняем только в localStorage (источник правды)
                const now = new Date().toISOString();
                const currentConsent = getConsent();
                const localStorageConsent: LocalStorageConsent = {
                    version: request.version,
                    given,
                    givenAt: given
                        ? now
                        : currentConsent?.givenAt?.toISOString() || now,
                    withdrawnAt: given ? undefined : now, // Сохраняем время отказа если given: false
                    preferences: request.preferences,
                };
                saveToLocalStorage(localStorageConsent);
                setLocalStorageVersion(prev => prev + 1);
            }
        },
        [isAuthenticated, saveMutation, getConsent, dbConsent],
    );

    // Отозвать согласие
    const withdrawConsent = useCallback(async (): Promise<void> => {
        if (isAuthenticated) {
            // Для зарегистрированных пользователей - обновляем БД (источник правды)
            await withdrawMutation.mutateAsync();
            // Также обновляем localStorage для быстрого доступа
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
            // Для незарегистрированных пользователей - обновляем localStorage (источник правды)
            const localStorageConsent = loadFromLocalStorage();
            if (localStorageConsent) {
                const updated: LocalStorageConsent = {
                    ...localStorageConsent,
                    given: false,
                    withdrawnAt: new Date().toISOString(), // Сохраняем время отзыва
                };
                saveToLocalStorage(updated);
                setLocalStorageVersion(prev => prev + 1);
            }
        }
    }, [isAuthenticated, withdrawMutation]);

    // Убрана синхронизация при авторизации - БД является источником правды для зарегистрированных пользователей
    // Если пользователь сначала дал согласие как незарегистрированный, а потом зарегистрировался,
    // он увидит баннер еще раз и сможет дать согласие уже как зарегистрированный пользователь

    // Проверка типов согласия
    const canUseFunctional = useCallback((): boolean => {
        const consent = getConsent();
        return consent?.given === true && consent.preferences.functional === true;
    }, [getConsent]);

    const canUseAnalytics = useCallback((): boolean => {
        const consent = getConsent();
        return consent?.given === true && consent.preferences.analytics === true;
    }, [getConsent]);

    const canUseMarketing = useCallback((): boolean => {
        const consent = getConsent();
        return consent?.given === true && consent.preferences.marketing === true;
    }, [getConsent]);

    const hasConsent = useCallback((): boolean => {
        const consent = getConsent();
        return consent?.given === true;
    }, [getConsent]);

    const needsConsent = useCallback((): boolean => {
        // Для зарегистрированных пользователей - ждем загрузки данных из БД
        if (isAuthenticated && loadingDb) {
            return false; // Не показываем пока не загрузили данные из БД
        }

        // Для незарегистрированных пользователей - данные из localStorage доступны сразу
        const consent = getConsent();
        
        // Если согласия нет - показываем баннер
        if (!consent) {
            return true;
        }
        
        // Проверяем версию политики
        if (consent.version !== COOKIE_CONSENT_VERSION) {
            return true;
        }
        
        // Если согласие дано - не показываем попап
        if (consent.given) {
            return false;
        }
        
        // Если согласие не дано (отказ), проверяем время по withdrawnAt
        // Если прошло менее 24 часов с момента отказа - не показываем попап
        if (!consent.given && consent.withdrawnAt) {
            const hoursSinceWithdrawal =
                (Date.now() - consent.withdrawnAt.getTime()) / (1000 * 60 * 60);
            if (hoursSinceWithdrawal < 24) {
                return false; // Прошло менее 24 часов - не показываем
            }
            // Прошло 24 часа или более - показываем попап снова
            return true;
        }
        
        // Если нет информации о времени отказа, но given: false - показываем попап
        return !consent.given;
    }, [getConsent, isAuthenticated, loadingDb]);

    // Состояние для отслеживания изменений localStorage (для неавторизованных пользователей)
    const [localStorageVersion, setLocalStorageVersion] = useState(0);

    // Отслеживаем изменения localStorage через событие storage
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

    // Мемоизируем consent чтобы избежать создания нового объекта при каждом рендере
    // Используем ключевые поля для стабильного сравнения
    const memoizedConsent = useMemo(() => {
        return getConsent();
    }, [
        isAuthenticated,
        // Используем примитивные значения для стабильного сравнения
        dbConsent?.id,
        dbConsent?.version,
        dbConsent?.given,
        dbConsent?.givenAt,
        dbConsent?.withdrawnAt,
        // Для неавторизованных пользователей отслеживаем изменения через версию
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

