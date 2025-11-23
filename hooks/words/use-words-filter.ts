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

        // Фильтр по группам
        if (filter.groupIds && filter.groupIds.length > 0) {
            result = result.filter(word => {
                // Проверяем, что у слова есть baseWord с группами
                if (!word.baseWord?.wordGroups) return false;

                // Проверяем, что слово принадлежит хотя бы одной из выбранных групп
                return word.baseWord.wordGroups.some(wg =>
                    filter.groupIds!.includes(wg.wordGroupId),
                );
            });
        }

        return result;
    }, [words, filter.language, filter.status, filter.groupIds]);

    return filteredWords;
};
