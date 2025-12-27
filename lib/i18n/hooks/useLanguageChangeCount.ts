import { Dispatch, SetStateAction, useEffect } from 'react';
import { i18n } from 'i18next';

export const useLanguageChangeCount = ({
    setCount,
    i18n,
}: {
    i18n: i18n;
    setCount: Dispatch<SetStateAction<number>>;
}) => {
    useEffect(() => {
        const languageCallback = () => setCount(prev => (prev + 1) % 1_000_000);

        if (i18n !== null) {
            i18n.on('languageChanged', languageCallback);
        }

        return () => {
            i18n.off('languageChanged', languageCallback);
        };
    }, [i18n, setCount]);
};
