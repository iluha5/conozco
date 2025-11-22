import { StageCard } from './stage-card';
import { TrainingStage } from '@/types/training.types';

interface StageSelectorProps {
    stages: TrainingStage[];
    currentStage: TrainingStage;
    onStageSelect: (_stage: TrainingStage) => void;
    getStageStatus?: (
        _stage: TrainingStage,
    ) => 'completed' | 'current' | 'pending';
}

export function StageSelector({
    stages,
    currentStage,
    onStageSelect,
    getStageStatus,
}: StageSelectorProps) {
    return (
        <div className="mb-6 overflow-x-auto py-2">
            <div className="flex gap-2 md:gap-4 justify-center min-w-max px-4">
                {stages.map((stage, index) => (
                    <StageCard
                        key={stage}
                        stage={stage}
                        index={index}
                        isActive={currentStage === stage}
                        status={
                            getStageStatus
                                ? getStageStatus(stage)
                                : currentStage === stage
                                  ? 'current'
                                  : 'pending'
                        }
                        onClick={() => onStageSelect(stage)}
                    />
                ))}
            </div>
        </div>
    );
}
