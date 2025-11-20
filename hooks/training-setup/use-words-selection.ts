import { useCallback } from 'react';
import { Word } from '@/types/words.types';
import { useTrainingWords } from '@/contexts/training-words-context';

export const useWordsSelection = (
    filteredWords: Word[],
    visibleCount: number,
) => {
    const { selectedWords, setSelectedWords } = useTrainingWords();

    const toggleWord = useCallback(
        (wordId: number) => {
            const wordIdStr = String(wordId);
            setSelectedWords(prev => {
                const newSet = new Set(prev);
                if (newSet.has(wordIdStr)) {
                    newSet.delete(wordIdStr);
                } else {
                    newSet.add(wordIdStr);
                }
                return newSet;
            });
        },
        [setSelectedWords],
    );

    const selectAllVisible = useCallback(() => {
        const visibleWordIds = filteredWords
            .slice(0, visibleCount)
            .map(w => String(w.id));
        setSelectedWords(
            prev => new Set([...Array.from(prev), ...visibleWordIds]),
        );
    }, [filteredWords, visibleCount, setSelectedWords]);

    const deselectAll = useCallback(() => {
        const visibleWordIds = filteredWords
            .slice(0, visibleCount)
            .map(w => String(w.id));
        setSelectedWords(prev => {
            const newSet = new Set(prev);
            visibleWordIds.forEach(id => newSet.delete(id));
            return newSet;
        });
    }, [filteredWords, visibleCount, setSelectedWords]);

    const isWordSelected = useCallback(
        (wordId: number) => selectedWords.has(String(wordId)),
        [selectedWords],
    );

    return {
        selectedWords,
        toggleWord,
        selectAllVisible,
        deselectAll,
        isWordSelected,
    };
};
