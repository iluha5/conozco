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
import { useTranslation } from '@/lib/i18n';

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
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!left-4 !right-4 !translate-x-0 !w-auto sm:!left-[50%] sm:!right-auto sm:!translate-x-[-50%] sm:!w-full sm:!max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <DialogTitle>
                            {t('You have an unfinished training')}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        {t(
                            'You can continue the existing training or start a new one. When starting a new training, the current progress will be reset.',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-4 sm:gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={onContinue}
                        loading={continueLoading}
                    >
                        {t('Continue')}
                    </Button>
                    <Button
                        variant="default"
                        onClick={onStartNew}
                        loading={startNewLoading}
                    >
                        {t('Start new')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
