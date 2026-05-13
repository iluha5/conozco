export interface CookiePreferences {
    necessary: boolean;
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
    givenAt: string;
    withdrawnAt?: string;
    preferences: CookiePreferences;
}

export interface CookieConsentRequest {
    version: string;
    given: boolean;
    preferences: CookiePreferences;
}

export const COOKIE_CONSENT_VERSION = '1.0';
export const COOKIE_CONSENT_STORAGE_KEY = 'cookie_consent';
