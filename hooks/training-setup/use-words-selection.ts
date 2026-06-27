import { useCallback, useMemo, useState } from 'react';
import { I18n, useTranslation } from '@/lib/i18n';
import { SetupWord } from '@/types/words.types';
import { useTrainingWords } from '@/contexts/training-words-context';

export type SelectionState = 'none' | 'partial' | 'all';

const getSelectionState = (
    selectedWords: Set<string>,
    visibleWords: SetupWord[],
): SelectionState => {
    const visibleWordIds = visibleWords.map(w => String(w.id));
    const selectedVisibleCount = visibleWordIds.filter(id =>
        selectedWords.has(id),
    ).length;
    const allSelected = selectedVisibleCount === visibleWords.length;
    const hasSelection = selectedVisibleCount > 0;

    if (!hasSelection) return 'none';
    if (allSelected) return 'all';
    return 'partial';
};

const getBulkSelectText = (selectionState: SelectionState, t: I18n['t']) => {
    return selectionState === 'all' ? t('Deselect all') : t('Select all');
};

export const useWordsSelection = (filteredWords: SetupWord[]) => {
    const { t } = useTranslation();
    const { selectedWords, setSelectedWords } = useTrainingWords();
    const [visibleWordsCount, setVisibleWordsCount] = useState(10);

    const visibleWords = useMemo(
        () => filteredWords.slice(0, visibleWordsCount),
        [filteredWords, visibleWordsCount],
    );

    const hasMoreWords = useMemo(
        () => filteredWords.length > visibleWordsCount,
        [filteredWords.length, visibleWordsCount],
    );

    const loadMoreWords = useCallback(() => {
        setVisibleWordsCount(prev => Math.min(prev + 12, filteredWords.length));
    }, [filteredWords.length]);

    const selectionState = useMemo(
        () => getSelectionState(selectedWords, visibleWords),
        [selectedWords, visibleWords],
    );

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
        const visibleWordIds = visibleWords.map(w => String(w.id));
        setSelectedWords(
            prev => new Set([...Array.from(prev), ...visibleWordIds]),
        );
    }, [visibleWords, setSelectedWords]);

    const deselectAll = useCallback(() => {
        const visibleWordIds = visibleWords.map(w => String(w.id));
        setSelectedWords(prev => {
            const newSet = new Set(prev);
            visibleWordIds.forEach(id => newSet.delete(id));
            return newSet;
        });
    }, [visibleWords, setSelectedWords]);

    const toggleAllWordsSelection = useCallback(() => {
        const visibleWordIds = visibleWords.map(w => String(w.id));
        const allSelected = visibleWordIds.every(id => selectedWords.has(id));

        if (allSelected) {
            setSelectedWords(prev => {
                const newSet = new Set(prev);
                visibleWordIds.forEach(id => newSet.delete(id));
                return newSet;
            });
        } else {
            setSelectedWords(
                prev => new Set([...Array.from(prev), ...visibleWordIds]),
            );
        }
    }, [visibleWords, selectedWords, setSelectedWords]);

    const isWordSelected = useCallback(
        (wordId: number) => selectedWords.has(String(wordId)),
        [selectedWords],
    );

    return {
        selectedWords,
        toggleWord,
        selectAllVisible,
        deselectAll,
        toggleAllWordsSelection,
        isWordSelected,
        selectionState,
        getBulkSelectText: () => getBulkSelectText(selectionState, t),
        visibleWords,
        visibleWordsCount,
        loadMoreWords,
        hasMoreWords,
    };
};
