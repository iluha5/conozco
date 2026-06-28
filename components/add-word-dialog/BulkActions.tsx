'use client';

import { Button } from '@/components/ui/button';
import { Square, CheckSquare, MinusSquare } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type BulkActionsProps = {
    words: Array<{ id: string | number; isAddedByUser: boolean }>;
    onToggleAllSelection: () => void;
    disabled: boolean;
};

export function BulkActions({
    words,
    onToggleAllSelection,
    disabled,
}: BulkActionsProps) {
    const { t } = useTranslation();
    const allSelected =
        words.length > 0 && words.every(word => word.isAddedByUser);
    const hasSelection = words.some(word => word.isAddedByUser);
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
