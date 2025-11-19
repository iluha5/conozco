import { Button } from '@/components/ui/button';

interface TrainingHeaderProps {
    onExit: () => void;
}

export function TrainingHeader({ onExit }: TrainingHeaderProps) {
    return (
        <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-gray-900 truncate">
                Тренировка
            </h1>
            <Button
                variant="outline"
                onClick={onExit}
                className="flex-shrink-0"
            >
                Завершить
            </Button>
        </div>
    );
}
