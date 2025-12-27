'use client';

import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type NextButtonProps = {
    onNext: () => void;
    isLastWord: boolean;
    isLoading?: boolean;
};

export function NextButton({
    onNext,
    isLastWord,
    isLoading = false,
}: NextButtonProps) {
    const { t } = useTranslation();

    return (
        <div className="flex justify-center pt-4">
            <Button
                size="lg"
                onClick={onNext}
                className="gap-2"
                disabled={isLoading}
                data-testid="stage1-next-button"
            >
                {isLastWord ? t('Finish') : t('Next word')}
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <ChevronRight className="w-5 h-5" />
                )}
            </Button>
        </div>
    );
}
