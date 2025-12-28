'use client';

import { useTranslation } from '@/lib/i18n';

export function WordsListEmpty() {
    const { t } = useTranslation();
    return (
        <div className="col-span-2 flex flex-col items-center justify-start pt-2 text-center">
            <p className="text-gray-500 mb-2">{t('Words not found')}</p>
            <p className="text-sm text-gray-400">
                {t('Try adding a word using the button')}{' '}
                <span className="font-semibold text-gray-600">
                    &quot;{t('Add')}&quot;
                </span>
            </p>
        </div>
    );
}
