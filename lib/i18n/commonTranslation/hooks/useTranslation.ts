'use client';

import { useContext, useState, useMemo } from 'react';

import { useLanguageChangeCount } from '../../hooks/useLanguageChangeCount';
import { TranslationContext } from '../contextConfig';

export const useTranslation = () => {
    const i18n = useContext(TranslationContext);
    const [, setCount] = useState(0);

    if (i18n === null) {
        throw new Error(
            'TranslationContext is used without TranslationProvider',
        );
    }

    useLanguageChangeCount({ i18n, setCount });

    const t = useMemo(() => i18n.t.bind(i18n), [i18n]);

    return { t };
};
