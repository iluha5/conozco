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
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface ConfirmationDialogsProps {
    deleteDialogOpen: boolean;
    statusDialogOpen: boolean;
    pendingStatusAction: 'LEARNED' | 'NOT_LEARNED' | null;
    selectedWordsCount: number;
    isDeleting?: boolean;
    isUpdatingStatus?: boolean;
    onCloseDeleteDialog: () => void;
    onCloseStatusDialog: () => void;
    onConfirmDelete: () => void;
    onConfirmStatus: () => void;
}

export function ConfirmationDialogs({
    deleteDialogOpen,
    statusDialogOpen,
    pendingStatusAction,
    selectedWordsCount,
    isDeleting = false,
    isUpdatingStatus = false,
    onCloseDeleteDialog,
    onCloseStatusDialog,
    onConfirmDelete,
    onConfirmStatus,
}: ConfirmationDialogsProps) {
    const { t } = useTranslation();
    const handleCloseDeleteDialog = () => {
        if (!isDeleting) {
            onCloseDeleteDialog();
        }
    };

    const handleCloseStatusDialog = () => {
        if (!isUpdatingStatus) {
            onCloseStatusDialog();
        }
    };

    return (
        <>
            {/* Диалог подтверждения удаления */}
            <Dialog
                open={deleteDialogOpen}
                onOpenChange={handleCloseDeleteDialog}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Delete confirmation')}</DialogTitle>
                        <DialogDescription>
                            {t(
                                'Are you sure you want to delete {{count}} word(s)? This action cannot be undone.',
                                { count: selectedWordsCount },
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseDeleteDialog}
                            disabled={isDeleting}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('Delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог подтверждения изменения статуса */}
            <Dialog
                open={statusDialogOpen}
                onOpenChange={handleCloseStatusDialog}
            >
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {t('Status change confirmation')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'Are you sure you want to mark {{count}} word(s) as {{status}}?',
                                {
                                    count: selectedWordsCount,
                                    status:
                                        pendingStatusAction === 'LEARNED'
                                            ? t('learned')
                                            : t('not learned'),
                                },
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-4">
                        <Button
                            variant="outline"
                            onClick={handleCloseStatusDialog}
                            disabled={isUpdatingStatus}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            onClick={onConfirmStatus}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {t('Confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
