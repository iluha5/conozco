import { ChevronDown, ChevronUp } from 'lucide-react';
import { TRAINING_STAGES } from '@/config/training-stages';
import { StageCard } from './stage-card';

interface StagesSelectorProps {
    enabledStages: Set<number>;
    showStagesSettings: boolean;
    onToggleVisibility: () => void;
    onToggleStage: (stage: number) => void;
    onOpenStageSettings: (stage: 1 | 4 | 5) => void;
}

export const StagesSelector = ({
    enabledStages,
    showStagesSettings,
    onToggleVisibility,
    onToggleStage,
    onOpenStageSettings,
}: StagesSelectorProps) => {
    return (
        <div>
            <button
                onClick={onToggleVisibility}
                className="flex items-center justify-between w-full text-left"
            >
                <h3 className="text-lg font-semibold">
                    Настройки этапов тренировки
                </h3>
                {showStagesSettings ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>
            {showStagesSettings && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {TRAINING_STAGES.map(stage => (
                        <StageCard
                            key={stage.id}
                            stage={stage}
                            enabled={enabledStages.has(stage.id)}
                            onToggle={onToggleStage}
                            onOpenSettings={
                                stage.hasSettings
                                    ? () =>
                                          onOpenStageSettings(
                                              stage.id as 1 | 4 | 5,
                                          )
                                    : undefined
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
