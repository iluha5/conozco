import { InitOptions, Resource } from 'i18next';

import { BASE_OPTIONS } from '../constants/i18NextOptions';

export const getStaticDictionaryOptions = (
    dictionary: Resource,
): InitOptions => {
    return {
        ...BASE_OPTIONS,
        resources: dictionary,
    };
};
