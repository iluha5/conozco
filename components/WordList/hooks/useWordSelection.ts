import { useState, useEffect } from 'react';
import type { Word } from '../typing';

export function useWordSelection(words: Word[]) {
    const [selectedWords, setSelectedWords] = useState<(string | number)[]>([]);

    useEffect(() => {
        // Reset selection when word list changes
        setSelectedWords([]);
    }, [words]);

    const toggleWordSelection = (wordId: string | number) => {
        setSelectedWords(prev =>
            prev.includes(wordId)
                ? prev.filter(id => id !== wordId)
                : [...prev, wordId],
        );
    };

    const _selectAllWords = () => {
        setSelectedWords(words.map(word => word.id));
    };

    const _deselectAllWords = () => {
        setSelectedWords([]);
    };

    const toggleAllWordsSelection = () => {
        const allSelected = selectedWords.length === words.length;
        if (allSelected) {
            setSelectedWords([]);
        } else {
            setSelectedWords(words.map(word => word.id));
        }
    };

    const isWordSelected = (wordId: string | number) => {
        return selectedWords.includes(wordId);
    };

    const clearSelection = () => {
        setSelectedWords([]);
    };

    return {
        selectedWords,
        toggleWordSelection,
        toggleAllWordsSelection,
        clearSelection,
        isWordSelected,
        // Internal functions for backward compatibility
        _selectAllWords,
        _deselectAllWords,
    };
}
