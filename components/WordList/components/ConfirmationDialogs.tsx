import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogsProps {
    deleteDialogOpen: boolean;
    statusDialogOpen: boolean;
    pendingStatusAction: 'LEARNED' | 'NOT_LEARNED' | null;
    selectedWordsCount: number;
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
    onCloseDeleteDialog,
    onCloseStatusDialog,
    onConfirmDelete,
    onConfirmStatus,
}: ConfirmationDialogsProps) {
    return (
        <>
            {/* Диалог подтверждения удаления */}
            <Dialog open={deleteDialogOpen} onOpenChange={onCloseDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Подтверждение удаления</DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите удалить {selectedWordsCount}{' '}
                            слов(а)? Это действие нельзя отменить.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={onCloseDeleteDialog}>
                            Отмена
                        </Button>
                        <Button variant="destructive" onClick={onConfirmDelete}>
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог подтверждения изменения статуса */}
            <Dialog open={statusDialogOpen} onOpenChange={onCloseStatusDialog}>
                <DialogContent>
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
                    <DialogFooter>
                        <Button variant="outline" onClick={onCloseStatusDialog}>
                            Отмена
                        </Button>
                        <Button onClick={onConfirmStatus}>Подтвердить</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
