import { useMemo } from 'react';
import { Word, WordsFilter } from '@/types/words.types';

export const useWordsFilter = (words: Word[], filter: WordsFilter) => {
    const filteredWords = useMemo(() => {
        let result = words;

        // Фильтр по языку
        if (filter.language !== 'ALL') {
            result = result.filter(
                word => word.language.code === filter.language,
            );
        }

        // Фильтр по статусу
        if (filter.status !== 'ALL') {
            result = result.filter(word => word.status === filter.status);
        }

        return result;
    }, [words, filter.language, filter.status]);

    return filteredWords;
};
