import { useMemo } from 'react';
import { Word, WordsStats } from '@/types/words.types';

export const useWordsStats = (
    words: Word[],
    selectedLanguage: string,
): WordsStats => {
    return useMemo(() => {
        // Фильтруем слова только по языку для статистики
        const wordsByLanguage =
            selectedLanguage === 'ALL'
                ? words
                : words.filter(word => word.language.code === selectedLanguage);

        return {
            total: wordsByLanguage.length,
            notLearned: wordsByLanguage.filter(w => w.status === 'NOT_LEARNED')
                .length,
            learned: wordsByLanguage.filter(w => w.status === 'LEARNED').length,
        };
    }, [words, selectedLanguage]);
};
