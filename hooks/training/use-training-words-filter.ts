import { useMemo } from 'react';
import { Word } from '@/types/training.types';

/**
 * Хук для фильтрации слов по языку и выбранным словам
 */
export function useTrainingWordsFilter(
    words: Word[],
    selectedLanguage: string,
    selectedWords: Set<string>,
) {
    return useMemo(() => {
        let filtered = words.filter(w => w.status === 'NOT_LEARNED');

        if (selectedLanguage !== 'ALL') {
            filtered = filtered.filter(
                word => word.language.code === selectedLanguage,
            );
        }

        if (selectedWords.size > 0) {
            filtered = filtered.filter(word => selectedWords.has(word.id));
        }

        return filtered;
    }, [words, selectedLanguage, selectedWords]);
}
