'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';

interface DeleteTrainingConfirmationDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    onConfirm: () => void;
}

export function DeleteTrainingConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
}: DeleteTrainingConfirmationDialogProps) {
    const { t } = useTranslation();

    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!left-4 !right-4 !translate-x-0 !w-auto max-w-[500px] sm:!left-[50%] sm:!right-auto sm:!translate-x-[-50%]">
                <DialogHeader>
                    <DialogTitle>{t('Delete training?')}</DialogTitle>
                    <DialogDescription className="!mt-6 !mb-4">
                        {t(
                            'Are you sure you want to delete the active training? All progress will be lost and cannot be recovered.',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        {t('Delete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
