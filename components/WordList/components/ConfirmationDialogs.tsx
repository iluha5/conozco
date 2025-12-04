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
                        <DialogTitle>Подтверждение удаления</DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите удалить {selectedWordsCount}{' '}
                            слов(а)? Это действие нельзя отменить.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseDeleteDialog}
                            disabled={isDeleting}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onConfirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Удалить
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
                            Подтверждение изменения статуса
                        </DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите отметить {selectedWordsCount}{' '}
                            слов(а) как{' '}
                            {pendingStatusAction === 'LEARNED'
                                ? 'выученные'
                                : 'невыученные'}
                            ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-4">
                        <Button
                            variant="outline"
                            onClick={handleCloseStatusDialog}
                            disabled={isUpdatingStatus}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={onConfirmStatus}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Подтвердить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
