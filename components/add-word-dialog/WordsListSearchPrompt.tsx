/**
 * Сообщение с предложением ввести текст в поле поиска
 */

'use client';

import { Search } from 'lucide-react';

export function WordsListSearchPrompt() {
    return (
        <div className="col-span-2 flex flex-col items-center justify-start pt-2 md:justify-center md:pt-0 h-full text-center">
            <Search className="hidden md:block w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">Начните поиск</p>
            <p className="text-sm text-gray-400">
                Введите слово или его часть в поле поиска,
                <br />
                чтобы найти слова в словаре
            </p>
        </div>
    );
}
