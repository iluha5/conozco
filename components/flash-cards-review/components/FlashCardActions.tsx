'use client';

import { Button } from '@/components/ui/button';
import { X, Check, Trash2 } from 'lucide-react';
import { CardAction } from '../typing';

interface FlashCardActionsProps {
    onAction: (_action: CardAction) => void;
    disabled?: boolean;
}

export function FlashCardActions({
    onAction,
    disabled = false,
}: FlashCardActionsProps) {
    const handleDontKnow = () => {
        if (!disabled) {
            onAction('dont-know');
        }
    };

    const handleKnow = () => {
        if (!disabled) {
            onAction('know');
        }
    };

    const handleDelete = () => {
        if (!disabled) {
            onAction('delete');
        }
    };

    return (
        <div className="flex flex-row justify-center gap-3 mt-4">
            <Button
                variant="destructive"
                size="lg"
                onClick={handleDontKnow}
                disabled={disabled}
                className="flex items-center gap-2"
            >
                <X className="w-5 h-5" />
                Не знаю
            </Button>
            <Button
                variant="outline"
                size="lg"
                onClick={handleDelete}
                disabled={disabled}
                className="flex items-center gap-2"
            >
                <Trash2 className="w-5 h-5" />
                Удалить
            </Button>
            <Button
                variant="default"
                size="lg"
                onClick={handleKnow}
                disabled={disabled}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
                <Check className="w-5 h-5" />
                Знаю
            </Button>
        </div>
    );
}
