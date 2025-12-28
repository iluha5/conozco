'use client';

import { Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export function WordsListSearchPrompt() {
    const { t } = useTranslation();
    return (
        <div className="col-span-2 flex flex-col items-center justify-start pt-2 md:justify-center md:pt-0 h-full text-center">
            <Search className="hidden md:block w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">{t('Start search')}</p>
            <p className="text-sm text-gray-400">
                {t('Enter a word or part of it in the search field,')}
                <br />
                {t('to find words in the dictionary')}
            </p>
        </div>
    );
}
