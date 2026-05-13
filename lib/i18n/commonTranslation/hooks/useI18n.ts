'use client';

import { useContext } from 'react';
import type { i18n } from 'i18next';

import { TranslationContext } from '../contextConfig';

export const useI18n = (): i18n => {
    const i18n = useContext(TranslationContext);

    if (i18n === null) {
        throw new Error(
            'TranslationContext is used without TranslationProvider',
        );
    }

    return i18n;
};
