'use client';

import { ComponentProps, useContext } from 'react';
import { Trans as BaseTrans } from 'react-i18next';

import { TranslationContext } from '../contextConfig';

type Props = ComponentProps<typeof BaseTrans>;

export const Trans = (props: Props) => {
    const i18n = useContext(TranslationContext);

    if (i18n === null) {
        throw new Error(
            'TranslationContext is used without TranslationProvider',
        );
    }

    return <BaseTrans i18n={i18n} {...props} />;
};
