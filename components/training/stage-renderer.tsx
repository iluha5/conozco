import { Stage1Training } from './stage1';
import { Stage2Training } from './stage2';
import { Stage3Training } from './stage3';
import { Stage4Training } from './stage4';
import { Stage5Training } from './stage5';
import { Stage6Training } from './stage6';
import { Word, TrainingStage } from '@/types/training.types';

interface StageRendererProps {
    stage: TrainingStage;
    words: Word[];
    onComplete: () => void;
}

export function StageRenderer({
    stage,
    words,
    onComplete,
}: StageRendererProps) {
    const StageComponents = {
        1: Stage1Training,
        2: Stage2Training,
        3: Stage3Training,
        4: Stage4Training,
        5: Stage5Training,
        6: Stage6Training,
    } as const;

    const StageComponent = StageComponents[stage];

    if (!StageComponent) {
        return null;
    }

    return <StageComponent words={words} onComplete={onComplete} />;
}
