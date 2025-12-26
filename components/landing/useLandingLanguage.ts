'use client';

import { useState, useEffect } from 'react';

export type LandingLanguage = 'ru' | 'en' | 'es';

const STORAGE_KEY = 'landing_language';
const DEFAULT_LANGUAGE: LandingLanguage = 'ru';

export function useLandingLanguage() {
    const [language, setLanguageState] = useState<LandingLanguage>(
        DEFAULT_LANGUAGE,
    );
    const [isLoaded, setIsLoaded] = useState(false);

    // Загружаем язык при монтировании
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLanguage = localStorage.getItem(STORAGE_KEY);
            if (
                savedLanguage &&
                (savedLanguage === 'ru' ||
                    savedLanguage === 'en' ||
                    savedLanguage === 'es')
            ) {
                setLanguageState(savedLanguage as LandingLanguage);
            }
            setIsLoaded(true);
        }
    }, []);

    // Сохраняем язык при изменении
    const setLanguage = (lang: LandingLanguage) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, lang);
        }
    };

    return {
        language,
        setLanguage,
        isLoaded,
    };
}

