import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import { trainingApi } from '@/lib/api/training.api';
import { Word } from '@/types/training.types';
import {
    readTrainingWordsCache,
    saveTrainingWordsCache,
} from '@/lib/training-words-cache';

function resolveWordIds(
    selectedWords: Set<string>,
    savedWordIds?: string[],
): string[] {
    if (selectedWords.size > 0) {
        return Array.from(selectedWords).map(String);
    }

    if (savedWordIds && savedWordIds.length > 0) {
        return savedWordIds.map(String);
    }

    return [];
}

export function useTrainingData(
    settingsLoaded: boolean,
    selectionLoaded: boolean,
    selectedWords: Set<string>,
    savedWordIds: string[] | undefined,
    onWordsLoaded: (_words: Word[]) => void,
    onLoadingChange: (_loading: boolean) => void,
) {
    const { toast } = useToast();
    const { t } = useTranslation();

    const fetchWords = useCallback(async () => {
        const wordIds = resolveWordIds(selectedWords, savedWordIds);

        if (wordIds.length === 0) {
            onWordsLoaded([]);
            return;
        }

        onLoadingChange(true);
        try {
            const cachedWords = readTrainingWordsCache(wordIds);
            if (cachedWords) {
                onWordsLoaded(cachedWords);
                return;
            }

            const data = await trainingApi.fetchTrainingWords({ wordIds });
            saveTrainingWordsCache(data);
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
    }, [onLoadingChange, onWordsLoaded, savedWordIds, selectedWords, toast, t]);

    useEffect(() => {
        if (settingsLoaded && selectionLoaded) {
            fetchWords();
        }
    }, [settingsLoaded, selectionLoaded, fetchWords]);

    return { fetchWords };
}
