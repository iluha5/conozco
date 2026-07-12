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

type RevokeExtensionTokenDialogProps = {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    onConfirm: () => void;
    tokenName: string;
    revoking: boolean;
};

export function RevokeExtensionTokenDialog({
    open,
    onOpenChange,
    onConfirm,
    tokenName,
    revoking,
}: RevokeExtensionTokenDialogProps) {
    const { t } = useTranslation();

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('Revoke extension token?')}</DialogTitle>
                    <DialogDescription>
                        {t(
                            'Revoke access for "{{name}}"? The extension will stop working until you connect again.',
                            { name: tokenName },
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-row justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={revoking}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={revoking}
                    >
                        {revoking ? t('Revoking...') : t('Revoke')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
