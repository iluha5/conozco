'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface NewTrainingConfirmationDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    onContinue: () => void;
    onStartNew: () => void;
    continueLoading?: boolean;
    startNewLoading?: boolean;
}

export function NewTrainingConfirmationDialog({
    open,
    onOpenChange,
    onContinue,
    onStartNew,
    continueLoading = false,
    startNewLoading = false,
}: NewTrainingConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!left-4 !right-4 !translate-x-0 !w-auto sm:!left-[50%] sm:!right-auto sm:!translate-x-[-50%] sm:!w-full">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <DialogTitle>
                            У вас есть незавершенная тренировка
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        Вы можете продолжить существующую тренировку или начать
                        новую. При начале новой тренировки текущий прогресс
                        будет сброшен.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={onContinue}
                        className="flex-1"
                        loading={continueLoading}
                    >
                        Продолжить
                    </Button>
                    <Button
                        variant="default"
                        onClick={onStartNew}
                        className="flex-1"
                        loading={startNewLoading}
                    >
                        Начать новую
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
