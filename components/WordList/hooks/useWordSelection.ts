import { useState, useEffect } from 'react';
import type { Word } from '../typing';

export function useWordSelection(words: Word[]) {
    const [selectedWords, setSelectedWords] = useState<(string | number)[]>([]);

    useEffect(() => {
        // Сбрасываем выделение при изменении списка слов
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
        // Внутренние функции для обратной совместимости
        _selectAllWords,
        _deselectAllWords,
    };
}
