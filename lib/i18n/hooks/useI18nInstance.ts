import { useMemo } from 'react';
import { i18n, InitOptions, Resource } from 'i18next';

import { getI18nClientInstance } from '../utils/getI18nClientInstance';

export const useI18nInstance = ({
    providedI18n,
    initOptions,
    dictionary,
}: {
    providedI18n?: i18n;
    initOptions?: InitOptions;
    dictionary?: Resource;
}) => {
    const i18n = useMemo(() => {
        if (providedI18n !== undefined) {
            return providedI18n;
        }

        return getI18nClientInstance({
            initOptions,
            dictionary,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { i18n };
};
