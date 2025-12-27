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

interface ExitConfirmationDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    onConfirm: () => void;
}

export function ExitConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
}: ExitConfirmationDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!left-4 !right-4 !translate-x-0 !w-auto sm:!left-[50%] sm:!right-auto sm:!translate-x-[-50%] ">
                <DialogHeader>
                    <DialogTitle>{t('Finish training?')}</DialogTitle>
                    <DialogDescription className="!mt-6 !mb-4">
                        {t('Current training results will be reset.')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        {t('Finish')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
