/**
 * Пустое состояние списка слов
 */

'use client';

export function WordsListEmpty() {
    return (
        <div className="col-span-2 flex flex-col items-center justify-start pt-2 text-center">
            <p className="text-gray-500 mb-2">Слова не найдены</p>
            <p className="text-sm text-gray-400">
                Попробуйте добавить слово с помощью кнопки{' '}
                <span className="font-semibold text-gray-600">
                    &quot;Добавить&quot;
                </span>
            </p>
        </div>
    );
}
