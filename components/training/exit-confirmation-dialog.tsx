import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!left-4 !right-4 !translate-x-0 !w-auto sm:!left-[50%] sm:!right-auto sm:!translate-x-[-50%] sm:!w-full">
                <DialogHeader>
                    <DialogTitle>Завершить тренировку?</DialogTitle>
                    <DialogDescription>
                        Результаты текущей тренировки будут сброшены.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Отмена
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Завершить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
