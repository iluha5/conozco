import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

type NextButtonProps = {
    onNext: () => void;
    isLastWord: boolean;
};

export function NextButton({ onNext, isLastWord }: NextButtonProps) {
    return (
        <div className="flex justify-center pt-4">
            <Button size="lg" onClick={onNext} className="gap-2">
                {isLastWord ? 'Завершить' : 'Следующее слово'}
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
    );
}
