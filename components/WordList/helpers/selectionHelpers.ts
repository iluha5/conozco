import type { Word } from '../typing';
import { I18n } from '@/lib/i18n';

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

export const getBulkSelectText = (
    selectionState: SelectionState,
    t: I18n['t'],
) => {
    return selectionState === t('all') ? t('Deselect all') : t('Select all');
};
