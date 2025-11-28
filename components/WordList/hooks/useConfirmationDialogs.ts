import { useState } from 'react';

export function useConfirmationDialogs() {
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] =
        useState(false);
    const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] =
        useState(false);
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
