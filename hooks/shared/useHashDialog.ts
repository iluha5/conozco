'use client';

import { useState, useEffect, useCallback } from 'react';

// Backs the dialog open state with a URL hash so the browser back button closes it.
export function useHashDialog(dialogId: string) {
    const [open, setOpenState] = useState(false);

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
                window.history.pushState(null, '', `#${dialogId}`);
                setOpenState(true);
            } else {
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
