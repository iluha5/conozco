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
import { BookOpen, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NoWordsDialogProps {
    open: boolean;
    onOpenChange: (_isOpen: boolean) => void;
}

export function NoWordsDialog({ open, onOpenChange }: NoWordsDialogProps) {
    const router = useRouter();

    const handleGoHome = () => {
        onOpenChange(false);
        router.push('/');
    };

    const handleGoToWords = () => {
        onOpenChange(false);
        router.push('/words');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Нет слов для тренировки</DialogTitle>
                    <DialogDescription className="!mt-6 !mb-4">
                        У вас нет слов для изучения на текущем языке. Выберите
                        один из вариантов:
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-3 sm:flex-col">
                    <Button
                        onClick={handleGoHome}
                        className="w-full"
                        variant="default"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Пройти проверку по группам слов
                    </Button>
                    <Button
                        onClick={handleGoToWords}
                        className="w-full"
                        variant="outline"
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Добавить слова вручную
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
