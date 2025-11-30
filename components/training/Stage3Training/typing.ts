import type { Word } from '@/types/training.types';

export type Stage3Props = {
    words: Word[];
    onComplete: () => void;
    isLastStage?: boolean;
};

export type MatchPair = {
    id: string;
    foreign: string;
    translation: string;
    matched: boolean;
    errorCount?: number;
    resultIndex?: number; // Индекс в массиве currentBatchResults
};
