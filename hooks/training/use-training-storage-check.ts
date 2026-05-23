import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { STORAGE_KEYS } from '@/config/storage-keys';

const STORAGE_KEY = STORAGE_KEYS.TRAINING_PROGRESS;

interface UseTrainingStorageCheckProps {
    selectedWordsCount: number;
}

export function useTrainingStorageCheck({
    selectedWordsCount,
}: UseTrainingStorageCheckProps) {
    const router = useRouter();
    const [isStorageChecked, setIsStorageChecked] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    useEffect(() => {
        const fromSetup =
            sessionStorage.getItem(STORAGE_KEYS.TRAINING_FROM_SETUP) === 'true';

        if (fromSetup) {
            sessionStorage.removeItem(STORAGE_KEYS.TRAINING_FROM_SETUP);
            setIsStorageChecked(true);
            return;
        }

        if (selectedWordsCount > 0) {
            setIsStorageChecked(true);
            return;
        }

        try {
            const savedProgress = localStorage.getItem(STORAGE_KEY);

            if (!savedProgress) {
                setShouldRedirect(true);
                setIsStorageChecked(true);
                return;
            }

            const parsed = JSON.parse(savedProgress);

            if (!parsed || !parsed.sessionId || !parsed.selectedWordIds) {
                localStorage.removeItem(STORAGE_KEY);
                setShouldRedirect(true);
                setIsStorageChecked(true);
                return;
            }

            setIsStorageChecked(true);
        } catch (error) {
            console.error('Error checking training progress:', error);
            localStorage.removeItem(STORAGE_KEY);
            setShouldRedirect(true);
            setIsStorageChecked(true);
        }
    }, [selectedWordsCount]);

    useEffect(() => {
        if (shouldRedirect) {
            router.push('/training/setup');
        }
    }, [shouldRedirect, router]);

    return { isStorageChecked, shouldRedirect };
}
