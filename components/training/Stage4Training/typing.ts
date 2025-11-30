import type { Word } from '@/types/training.types';

export type Stage4Props = {
    words: Word[];
    onComplete: () => void;
};

export type LetterState = {
    letter: string;
    selected: boolean;
};
