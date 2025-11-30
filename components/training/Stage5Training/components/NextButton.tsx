import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

type NextButtonProps = {
    onNext: () => void;
};

export function NextButton({ onNext }: NextButtonProps) {
    return (
        <div className="flex justify-center pt-4">
            <Button size="lg" onClick={onNext} className="gap-2">
                Следующее предложение
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
    );
}
