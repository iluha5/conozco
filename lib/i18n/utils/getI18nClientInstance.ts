'use client';

import { initReactI18next } from 'react-i18next';
import i18n, { InitOptions, Module, Resource } from 'i18next';
import httpMiddleware from 'i18next-http-backend';

import { getClientOptions } from './getClientOptions';
import { getStaticDictionaryOptions } from './getStaticDictionaryOptions';

type Params = {
    initOptions?: InitOptions;
    middlewares?: Module[];
    dictionary?: Resource;
};

export const getI18nClientInstance = (params: Params = {}) => {
    const defaultMiddlewares: Module[] = [initReactI18next];
    const { dictionary } = params;

    if (!dictionary) {
        defaultMiddlewares.push(httpMiddleware);
    }

    const { initOptions, middlewares = defaultMiddlewares } = params;

    const instance = i18n.createInstance();
    middlewares.forEach(instance.use);
    instance.init({
        ...(dictionary
            ? getStaticDictionaryOptions(dictionary)
            : getClientOptions()),
        ...initOptions,
    });

    return instance;
};
