import { Stage1Training } from './Stage1Training/Stage1Training';
import { Stage2Training } from './Stage2Training/Stage2Training';
import { Stage3Training } from './Stage3Training/Stage3Training';
import { Stage4Training } from './Stage4Training/Stage4Training';
import { Stage5Training } from './Stage5Training/Stage5Training';
import { Stage6Training } from './Stage6Training';
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
