import { useMemo } from 'react';
import { Word, WordsFilter } from '@/types/words.types';

export const useWordsFilter = (words: Word[], filter: WordsFilter) => {
    const filteredWords = useMemo(() => {
        let result = words;

        // Language filter
        if (filter.language !== 'ALL') {
            result = result.filter(
                word => word.language.code === filter.language,
            );
        }

        // Status filter
        if (filter.status !== 'ALL') {
            result = result.filter(word => word.status === filter.status);
        }

        // Group filter
        if (filter.groupIds && filter.groupIds.length > 0) {
            result = result.filter(word => {
                // Check that word has baseWord with groups
                if (!word.baseWord?.wordGroups) return false;

                // Check that word belongs to at least one of selected groups
                return word.baseWord.wordGroups.some(wg =>
                    filter.groupIds!.includes(wg.wordGroupId),
                );
            });
        }

        return result;
    }, [words, filter.language, filter.status, filter.groupIds]);

    return filteredWords;
};
