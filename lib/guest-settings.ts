import { STORAGE_KEYS } from '@/config/storage-keys';
import {
    AVAILABLE_LEARN_LANGUAGES,
    LearnLanguageCode,
} from '@/config/learn-languages';

export type GuestLanguageCode = 'en' | 'es' | 'ru';

export interface GuestSettings {
    ownLanguageId: number;
    learnLanguageId: number;
    interfaceLanguageId: number;
}

export const GUEST_LANGUAGE_MAP: Record<
    GuestLanguageCode,
    { id: number; code: GuestLanguageCode; name: string }
> = {
    en: { id: 1, code: 'en', name: 'English' },
    es: { id: 2, code: 'es', name: 'Spanish' },
    ru: { id: 3, code: 'ru', name: 'Russian' },
};

const SUPPORTED_GUEST_LANGUAGE_CODES: GuestLanguageCode[] = ['en', 'es', 'ru'];

export function detectBrowserLanguageCode(): GuestLanguageCode {
    if (typeof navigator === 'undefined') {
        return 'en';
    }

    const primaryCode = navigator.language.split('-')[0].toLowerCase();

    if (
        SUPPORTED_GUEST_LANGUAGE_CODES.includes(
            primaryCode as GuestLanguageCode,
        )
    ) {
        return primaryCode as GuestLanguageCode;
    }

    return 'en';
}

export function getDefaultLearnLanguageCode(
    ownLanguageCode: GuestLanguageCode,
): LearnLanguageCode {
    const candidate = AVAILABLE_LEARN_LANGUAGES.find(
        code => code !== ownLanguageCode,
    );

    return candidate ?? 'es';
}

export function getDefaultGuestSettings(): GuestSettings {
    const ownCode = detectBrowserLanguageCode();
    const learnCode = getDefaultLearnLanguageCode(ownCode);
    const interfaceCode = ownCode;

    return {
        ownLanguageId: GUEST_LANGUAGE_MAP[ownCode].id,
        learnLanguageId: GUEST_LANGUAGE_MAP[learnCode].id,
        interfaceLanguageId: GUEST_LANGUAGE_MAP[interfaceCode].id,
    };
}

export function readGuestSettings(): GuestSettings {
    if (typeof window === 'undefined') {
        return getDefaultGuestSettings();
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEYS.GUEST_SETTINGS);

        if (!stored) {
            return getDefaultGuestSettings();
        }

        const parsed = JSON.parse(stored) as Partial<GuestSettings>;

        if (
            typeof parsed.ownLanguageId === 'number' &&
            typeof parsed.learnLanguageId === 'number' &&
            typeof parsed.interfaceLanguageId === 'number'
        ) {
            return {
                ownLanguageId: parsed.ownLanguageId,
                learnLanguageId: parsed.learnLanguageId,
                interfaceLanguageId: parsed.interfaceLanguageId,
            };
        }
    } catch {
        // Fall through to defaults
    }

    return getDefaultGuestSettings();
}

export function writeGuestSettings(settings: GuestSettings): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem(STORAGE_KEYS.GUEST_SETTINGS, JSON.stringify(settings));
}

export function getLanguageById(languageId: number) {
    return Object.values(GUEST_LANGUAGE_MAP).find(
        language => language.id === languageId,
    );
}
