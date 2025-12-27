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
import { useTranslation } from '@/lib/i18n';

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
    const { t } = useTranslation();
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
        ? t('No learned words')
        : t('No words for training');

    const description = isLearnedMode
        ? t(
              'You do not have learned words yet. Complete new words training to add to learned list.',
          )
        : t(
              'You have no words to learn in the current language. Choose one of the options:',
          );

    const primaryButtonText = isLearnedMode
        ? t('Go to new words')
        : t('Take group words check');

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
                            {t('Add words manually')}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
