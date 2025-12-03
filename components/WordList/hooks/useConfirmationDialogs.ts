import { useState } from 'react';
import { useHashDialog } from '@/hooks/shared';

export function useConfirmationDialogs() {
    const {
        open: confirmDeleteDialogOpen,
        setOpen: setConfirmDeleteDialogOpen,
    } = useHashDialog('confirm-delete-words');
    const {
        open: confirmStatusDialogOpen,
        setOpen: setConfirmStatusDialogOpen,
    } = useHashDialog('confirm-status-change');
    const [pendingStatusAction, setPendingStatusAction] = useState<
        'LEARNED' | 'NOT_LEARNED' | null
    >(null);

    const handleCloseDeleteDialog = () => {
        setConfirmDeleteDialogOpen(false);
    };

    const handleCloseStatusDialog = () => {
        setConfirmStatusDialogOpen(false);
    };

    const openDeleteConfirmation = () => {
        setConfirmDeleteDialogOpen(true);
    };

    const openStatusConfirmation = (action: 'LEARNED' | 'NOT_LEARNED') => {
        setPendingStatusAction(action);
        setConfirmStatusDialogOpen(true);
    };

    const closeStatusConfirmation = () => {
        setConfirmStatusDialogOpen(false);
        setPendingStatusAction(null);
    };

    const setDeleteDialogOpen = (open: boolean) => {
        setConfirmDeleteDialogOpen(open);
    };

    const setStatusDialogOpen = (open: boolean) => {
        setConfirmStatusDialogOpen(open);

        if (!open) {
            setPendingStatusAction(null);
        }
    };

    return {
        confirmDeleteDialogOpen,
        confirmStatusDialogOpen,
        pendingStatusAction,
        handleCloseDeleteDialog,
        handleCloseStatusDialog,
        openDeleteConfirmation,
        openStatusConfirmation,
        closeStatusConfirmation,
        setDeleteDialogOpen,
        setStatusDialogOpen,
    };
}
