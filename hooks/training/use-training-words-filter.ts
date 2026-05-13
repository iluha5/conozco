import { useMemo } from 'react';
import { Word } from '@/types/training.types';
import { STORAGE_KEYS } from '@/config/storage-keys';

export function useTrainingWordsFilter(
    words: Word[],
    selectedLanguage: string,
    selectedWords: Set<string>,
) {
    return useMemo(() => {
        const wordSource =
            typeof window !== 'undefined'
                ? sessionStorage.getItem(STORAGE_KEYS.TRAINING_WORD_SOURCE)
                : null;
        const expectedStatus =
            wordSource === 'LEARNED' ? 'LEARNED' : 'NOT_LEARNED';

        let filtered = words.filter(word => word.status === expectedStatus);

        if (selectedLanguage !== 'ALL') {
            filtered = filtered.filter(
                word => word.language.code === selectedLanguage,
            );
        }

        if (selectedWords.size > 0) {
            filtered = filtered.filter(word =>
                selectedWords.has(String(word.id)),
            );
        }

        return filtered;
    }, [words, selectedLanguage, selectedWords]);
}
