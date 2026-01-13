/**
 * Типы для работы с согласием на использование куки
 */

export interface CookiePreferences {
    necessary: boolean; // always true
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
}

export interface CookieConsent {
    id: number;
    userId: number;
    version: string;
    given: boolean;
    givenAt: Date | null;
    withdrawnAt: Date | null;
    preferences: CookiePreferences;
    createdAt: Date;
    updatedAt: Date;
}

export interface CookieConsentResponse {
    id: number;
    userId: number;
    version: string;
    given: boolean;
    givenAt: string | null;
    withdrawnAt: string | null;
    preferences: CookiePreferences;
    createdAt: string;
    updatedAt: string;
}

export interface LocalStorageConsent {
    version: string;
    given: boolean;
    givenAt: string; // ISO date string
    withdrawnAt?: string; // ISO date string (optional, only if given: false)
    preferences: CookiePreferences;
}

export interface CookieConsentRequest {
    version: string;
    given: boolean;
    preferences: CookiePreferences;
}

export const COOKIE_CONSENT_VERSION = '1.0';
export const COOKIE_CONSENT_STORAGE_KEY = 'cookie_consent';
