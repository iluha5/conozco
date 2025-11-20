import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings } from 'lucide-react';
import { TrainingStage } from '@/config/training-stages';

interface StageCardProps {
    stage: TrainingStage;
    enabled: boolean;
    onToggle: (stageId: number) => void;
    onOpenSettings?: () => void;
}

export const StageCard = ({
    stage,
    enabled,
    onToggle,
    onOpenSettings,
}: StageCardProps) => {
    return (
        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <Checkbox
                id={`setup-stage-${stage.id}`}
                checked={enabled}
                onChange={() => {}} // Пустой обработчик, чтобы предотвратить warnings
                onClick={() => onToggle(stage.id)}
                className="cursor-pointer"
            />
            <div
                className="flex-1 cursor-pointer"
                onClick={() => onToggle(stage.id)}
            >
                <div className="text-sm font-medium leading-none">
                    {stage.name}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                    {stage.description}
                </p>
            </div>
            {stage.hasSettings && onOpenSettings && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                        e.stopPropagation();
                        onOpenSettings();
                    }}
                    className="p-2 h-auto shrink-0"
                    title="Настройки этапа"
                >
                    <Settings className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
};
