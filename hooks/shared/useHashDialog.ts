/**
 * Хук для синхронизации состояния диалога с URL hash
 * Позволяет закрывать диалог кнопкой "Назад" в браузере
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export function useHashDialog(dialogId: string) {
    const [open, setOpenState] = useState(false);

    // Слушаем изменения в истории браузера (кнопка "Назад")
    useEffect(() => {
        const handlePopState = () => {
            const currentHash = window.location.hash;

            if (currentHash !== `#${dialogId}` && open) {
                setOpenState(false);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [dialogId, open]);

    const setOpen = useCallback(
        (value: boolean) => {
            if (value) {
                // Открытие: добавляем hash в историю
                window.history.pushState(null, '', `#${dialogId}`);
                setOpenState(true);
            } else {
                // Закрытие: возвращаемся назад, если мы на hash диалога
                if (window.location.hash === `#${dialogId}`) {
                    window.history.back();
                }

                setOpenState(false);
            }
        },
        [dialogId],
    );

    return { open, setOpen };
}
