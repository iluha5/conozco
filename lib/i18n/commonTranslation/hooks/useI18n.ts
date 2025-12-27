'use client';

import { useContext } from 'react';
import type { i18n } from 'i18next';

import { TranslationContext } from '../contextConfig';

/**
 * Хук для получения прямого доступа к i18n instance
 * Используется когда нужно программно изменить язык или получить доступ к другим методам i18n
 */
export const useI18n = (): i18n => {
    const i18n = useContext(TranslationContext);

    if (i18n === null) {
        throw new Error(
            'TranslationContext is used without TranslationProvider',
        );
    }

    return i18n;
};
