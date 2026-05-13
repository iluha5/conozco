import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import { trainingApi } from '@/lib/api/training.api';
import { Word } from '@/types/training.types';
import { STORAGE_KEYS } from '@/config/storage-keys';

export function useTrainingData(
    settingsLoaded: boolean,
    selectionLoaded: boolean,
    onWordsLoaded: (_words: Word[]) => void,
    onLoadingChange: (_loading: boolean) => void,
) {
    const { toast } = useToast();
    const { t } = useTranslation();

    const fetchWords = useCallback(async () => {
        onLoadingChange(true);
        try {
            const wordSource =
                typeof window !== 'undefined'
                    ? sessionStorage.getItem(STORAGE_KEYS.TRAINING_WORD_SOURCE)
                    : null;
            const status = wordSource === 'LEARNED' ? 'LEARNED' : 'NOT_LEARNED';

            const data = await trainingApi.fetchWords(status);
            onWordsLoaded(data);
        } catch (error) {
            console.error('Error fetching words:', error);
            toast({
                title: t('Error'),
                description: t('Failed to load words'),
                variant: 'destructive',
            });
        } finally {
            onLoadingChange(false);
        }
    }, [onLoadingChange, onWordsLoaded, toast, t]);

    useEffect(() => {
        if (settingsLoaded && selectionLoaded) {
            fetchWords();
        }
    }, [settingsLoaded, selectionLoaded, fetchWords]);

    return { fetchWords };
}
