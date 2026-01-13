import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { STORAGE_KEYS } from '@/config/storage-keys';

const STORAGE_KEY = STORAGE_KEYS.TRAINING_PROGRESS;

interface UseTrainingStorageCheckProps {
    selectedWordsCount: number;
}

/**
 * Хук для проверки наличия незавершённой тренировки в localStorage
 * и выполнения редиректа на страницу настройки при необходимости
 */
export function useTrainingStorageCheck({
    selectedWordsCount,
}: UseTrainingStorageCheckProps) {
    const router = useRouter();
    const [isStorageChecked, setIsStorageChecked] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    // Early check for unfinished training - executed BEFORE data loading
    useEffect(() => {
        // Check if user came from setup page
        const fromSetup =
            sessionStorage.getItem(STORAGE_KEYS.TRAINING_FROM_SETUP) === 'true';

        if (fromSetup) {
            // Clear flag after use
            sessionStorage.removeItem(STORAGE_KEYS.TRAINING_FROM_SETUP);
            // If user came from setup page, allow initialization
            setIsStorageChecked(true);
            return;
        }

        // If there are selected words in context, user came from setup page
        if (selectedWordsCount > 0) {
            setIsStorageChecked(true);
            return;
        }

        // Check localStorage synchronously
        try {
            const savedProgress = localStorage.getItem(STORAGE_KEY);

            if (!savedProgress) {
                // If no unfinished training, redirect to setup page
                setShouldRedirect(true);
                setIsStorageChecked(true);
                return;
            }

            // Check that data is valid
            const parsed = JSON.parse(savedProgress);

            if (!parsed || !parsed.sessionId || !parsed.selectedWordIds) {
                // If data invalid, clear and redirect
                localStorage.removeItem(STORAGE_KEY);
                setShouldRedirect(true);
                setIsStorageChecked(true);
                return;
            }

            // If valid unfinished training exists, allow initialization
            setIsStorageChecked(true);
        } catch (error) {
            // If parsing error occurred, clear and redirect
            console.error('Error checking training progress:', error);
            localStorage.removeItem(STORAGE_KEY);
            setShouldRedirect(true);
            setIsStorageChecked(true);
        }
    }, [selectedWordsCount]);

    // Execute redirect after localStorage check
    useEffect(() => {
        if (shouldRedirect) {
            router.push('/training/setup');
        }
    }, [shouldRedirect, router]);

    return {
        isStorageChecked,
        shouldRedirect,
    };
}
