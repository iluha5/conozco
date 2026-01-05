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
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface LanguageChangeConfirmationDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    onConfirm: () => void;
    saving?: boolean;
}

export function LanguageChangeConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    saving = false,
}: LanguageChangeConfirmationDialogProps) {
    const { t } = useTranslation();

    const handleClose = () => {
        if (!saving) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!left-4 !right-4 !translate-x-0 !w-auto max-w-[500px] sm:!left-[50%] sm:!right-auto sm:!translate-x-[-50%]">
                <DialogHeader>
                    <DialogTitle>
                        {t('Change learning language?')}
                    </DialogTitle>
                    <DialogDescription className="!mt-6 !mb-4">
                        {t(
                            'You have an active training session. Changing the learning language will reset your training progress. Do you want to continue?',
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={saving}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('Saving...')}
                            </>
                        ) : (
                            t('Save')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

