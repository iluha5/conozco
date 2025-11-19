import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/shared';
import { trainingApi } from '@/lib/api/training.api';
import { Word } from '@/types/training.types';

/**
 * Хук для загрузки данных тренировки
 */
export function useTrainingData(
    settingsLoaded: boolean,
    selectionLoaded: boolean,
    onWordsLoaded: (words: Word[]) => void,
    onLoadingChange: (loading: boolean) => void,
) {
    const { toast } = useToast();

    const fetchWords = useCallback(async () => {
        onLoadingChange(true);
        try {
            const data = await trainingApi.fetchWords('NOT_LEARNED');
            onWordsLoaded(data);
        } catch (error) {
            console.error('Error fetching words:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить слова',
                variant: 'destructive',
            });
        } finally {
            onLoadingChange(false);
        }
    }, [toast, onWordsLoaded, onLoadingChange]);

    useEffect(() => {
        if (settingsLoaded && selectionLoaded) {
            fetchWords();
        }
    }, [settingsLoaded, selectionLoaded, fetchWords]);

    return { fetchWords };
}
