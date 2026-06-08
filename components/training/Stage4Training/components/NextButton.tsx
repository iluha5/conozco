import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

type NextButtonProps = {
    onNext: () => void;
};

export function NextButton({ onNext }: NextButtonProps) {
    const { t } = useTranslation();
    return (
        <div className="flex justify-center pt-4">
            <Button size="lg" onClick={onNext} className="gap-2">
                {t('Next word')}
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
    );
}
