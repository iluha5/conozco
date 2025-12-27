import { useEffect } from 'react';
import { i18n } from 'i18next';

export const useLanguageChange = ({
    i18n,
    lang,
}: {
    i18n: i18n;
    lang?: string;
}) => {
    useEffect(() => {
        if (i18n.language !== lang) {
            i18n.changeLanguage(lang);
        }
    }, [lang, i18n]);
};
