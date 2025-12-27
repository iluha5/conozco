'use client';

import { memo, PropsWithChildren } from 'react';
import { i18n, InitOptions, Resource } from 'i18next';
export type I18n = i18n;

import { useI18nInstance } from '../../hooks/useI18nInstance';
import { useLanguageChange } from '../../hooks/useLanguageChange';
import { TranslationContext } from '../contextConfig';

export type Props = PropsWithChildren<{
    initOptions?: InitOptions;
    i18n?: i18n;
    lang?: string;
    dictionary?: Resource;
}>;

export const TranslationProvider = memo(
    ({
        lang,
        children,
        initOptions,
        i18n: providedI18n,
        dictionary,
    }: Props) => {
        const { i18n } = useI18nInstance({
            providedI18n,
            initOptions,
            dictionary,
        });

        useLanguageChange({ lang, i18n });

        return (
            <TranslationContext.Provider value={i18n}>
                {children}
            </TranslationContext.Provider>
        );
    },
);

TranslationProvider.displayName = 'TranslationProvider';

export default TranslationProvider;
