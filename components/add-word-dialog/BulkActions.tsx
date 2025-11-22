/**
 * Кнопки массовых действий
 */

'use client';

import { Button } from '@/components/ui/button';

type BulkActionsProps = {
    onSelectAll: () => void;
    onDeselectAll: () => void;
    disabled: boolean;
};

export function BulkActions({
    onSelectAll,
    onDeselectAll,
    disabled,
}: BulkActionsProps) {
    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onSelectAll}
                disabled={disabled}
            >
                Выбрать все
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onDeselectAll}
                disabled={disabled}
            >
                Отменить все
            </Button>
        </div>
    );
}
