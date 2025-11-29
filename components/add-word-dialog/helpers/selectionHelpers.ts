import type { SelectionState } from '@/components/WordList/helpers/selectionHelpers';

export const getAddWordDialogBulkSelectText = (
    selectionState: SelectionState,
): string => {
    return selectionState === 'all' ? 'Убрать все' : 'Добавить все';
};
