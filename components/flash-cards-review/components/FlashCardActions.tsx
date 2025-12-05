'use client';

import { Button } from '@/components/ui/button';
import { X, Check, Trash2, SkipForward } from 'lucide-react';
import { CardAction } from '../typing';

interface FlashCardActionsProps {
    onAction: (_action: CardAction) => void;
    disabled?: boolean;
    belongsToUser?: boolean;
}

export function FlashCardActions({
    onAction,
    disabled = false,
    belongsToUser = true,
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

    const handleDeleteOrSkip = () => {
        if (!disabled) {
            onAction(belongsToUser ? 'delete' : 'skip');
        }
    };

    return (
        <div className="flex flex-row justify-center gap-3 mt-4">
            <Button
                variant="destructive"
                size="lg"
                onClick={handleDeleteOrSkip}
                disabled={disabled}
                className="flex items-center gap-2"
            >
                {belongsToUser ? (
                    <>
                        <Trash2 className="w-5 h-5" />
                        Удалить
                    </>
                ) : (
                    <>
                        <SkipForward className="w-5 h-5" />
                        Пропустить
                    </>
                )}
            </Button>
            <Button
                variant="outline"
                size="lg"
                onClick={handleDontKnow}
                disabled={disabled}
                className="flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-50"
            >
                <X className="w-5 h-5" />
                Не знаю
            </Button>
            <Button
                variant="default"
                size="lg"
                onClick={handleKnow}
                disabled={disabled}
                className="flex items-center gap-2 bg-black text-white hover:bg-gray-800"
            >
                <Check className="w-5 h-5" />
                Знаю
            </Button>
        </div>
    );
}
