import { Resource } from 'i18next';

import enGlob from '../locales/en/glob.json';
import ruGlob from '../locales/ru/glob.json';
import esGlob from '../locales/es/glob.json';

export const getStaticResources = (): Resource => {
    return {
        en: {
            glob: enGlob,
        },
        ru: {
            glob: ruGlob,
        },
        es: {
            glob: esGlob,
        },
    };
};
