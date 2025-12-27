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
import { TrainingModeGroupId } from '../types/typing';

interface NoWordsDialogProps {
    open: boolean;
    onOpenChange: (_isOpen: boolean) => void;
    mode?: TrainingModeGroupId;
}

export function NoWordsDialog({
    open,
    onOpenChange,
    mode = 'new',
}: NoWordsDialogProps) {
    const router = useRouter();

    const handleGoHome = () => {
        onOpenChange(false);
        router.push('/');
    };

    const handleGoToWords = () => {
        onOpenChange(false);
        router.push('/words');
    };

    const isLearnedMode = mode === 'learned' || mode === 'tests';

    const title = isLearnedMode
        ? 'Нет изученных слов'
        : 'Нет слов для тренировки';

    const description = isLearnedMode
        ? 'У вас пока нет изученных слов. Пройдите тренировку новых слов, чтобы пополнить список изученных.'
        : 'У вас нет слов для изучения на текущем языке. Выберите один из вариантов:';

    const primaryButtonText = isLearnedMode
        ? 'Перейти к новым словам'
        : 'Пройти проверку по группам слов';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="!mt-6 !mb-4">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-3 sm:flex-col">
                    <Button
                        onClick={handleGoHome}
                        className="w-full"
                        variant="default"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        {primaryButtonText}
                    </Button>
                    {mode === 'new' && (
                        <Button
                            onClick={handleGoToWords}
                            className="w-full"
                            variant="outline"
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Добавить слова вручную
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
