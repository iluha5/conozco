import { InitOptions } from 'i18next';

import { namespaces } from './namespaces';

export const BASE_OPTIONS: InitOptions = {
    lng: 'en',
    fallbackLng: 'en',
    nsSeparator: ':::',
    returnEmptyString: false,
    ns: namespaces,
    defaultNS: 'glob',
    interpolation: {
        escapeValue: false, // react already safes from xss
    },
};
