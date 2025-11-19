import { Button } from '@/components/ui/button';
import { Pause, Home } from 'lucide-react';

interface TrainingHeaderProps {
    onExit: () => void;
    onPause: () => void;
}

export function TrainingHeader({ onExit, onPause }: TrainingHeaderProps) {
    return (
        <div className="mb-8 flex items-center justify-between gap-4">
            <h1 className="text-4xl font-bold text-gray-900 truncate">
                Тренировка
            </h1>
            <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" onClick={onPause} className="px-3">
                    <Pause className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Приостановить</span>
                </Button>
                <Button variant="outline" onClick={onExit} className="px-3">
                    <Home className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Завершить</span>
                </Button>
            </div>
        </div>
    );
}
