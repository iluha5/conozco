import type { Word } from '../typing';

export type SelectionState = 'none' | 'partial' | 'all';

export const getSelectionState = (
    selectedWords: (string | number)[],
    words: Word[],
): SelectionState => {
    const allSelected = selectedWords.length === words.length;
    const hasSelection = selectedWords.length > 0;

    if (!hasSelection) return 'none';
    if (allSelected) return 'all';
    return 'partial';
};

export const getBulkSelectText = (selectionState: SelectionState) => {
    return selectionState === 'all' ? 'Снять все' : 'Выбрать все';
};
