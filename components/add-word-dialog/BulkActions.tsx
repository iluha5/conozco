/**
 * Кнопки массовых действий
 */

'use client';

import { Button } from '@/components/ui/button';
import { Square, CheckSquare, MinusSquare } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type BulkActionsProps = {
    words: Array<{ id: string }>;
    selectedWords: string[];
    onToggleAllSelection: () => void;
    disabled: boolean;
};

export function BulkActions({
    words,
    selectedWords,
    onToggleAllSelection,
    disabled,
}: BulkActionsProps) {
    const { t } = useTranslation();
    // Determine selection state based on number of selected words
    const allSelected =
        words.length > 0 && selectedWords.length === words.length;
    const hasSelection = selectedWords.length > 0;
    const selectionState: 'none' | 'partial' | 'all' = !hasSelection
        ? 'none'
        : allSelected
          ? 'all'
          : 'partial';

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onToggleAllSelection}
            disabled={disabled}
        >
            {(() => {
                if (selectionState === 'none') {
                    return <Square className="mr-2 h-4 w-4" />;
                } else if (selectionState === 'all') {
                    return <CheckSquare className="mr-2 h-4 w-4" />;
                } else {
                    return <MinusSquare className="mr-2 h-4 w-4" />;
                }
            })()}
            {selectionState === 'all' ? t('Remove all') : t('Add all')}
        </Button>
    );
}
