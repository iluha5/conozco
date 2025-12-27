'use client';

import { InitOptions } from 'i18next';
import { HttpBackendOptions } from 'i18next-http-backend';

import { localesBuildHash } from '../constants/constants';
import { BASE_OPTIONS } from '../constants/i18NextOptions';

export const getClientOptions = (): InitOptions & {
    backend: HttpBackendOptions;
} => {
    const loadPath = [`/locales/{{lng}}/{{ns}}.${localesBuildHash}.json`]
        .filter(str => str !== undefined && str.length > 0)
        .join('');

    return {
        ...BASE_OPTIONS,
        backend: {
            loadPath,
            request: async function (options, url, payload, callback) {
                // prevent i18n to download eng file
                if (url.includes('/locales/en/')) {
                    callback(null, {
                        status: 200,
                        data: {},
                    });
                    return;
                }

                const data = await fetch(url, {
                    cache: 'force-cache',
                }).then(res => res.json());

                callback(null, {
                    data,
                    status: 200,
                });
            },
        },
    };
};
