import type { Word } from '@/types/training.types';

export type Stage1Props = {
    words: Word[];
    onComplete: () => void;
    isLastStage?: boolean;
};
