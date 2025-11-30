import type { Word } from '@/types/training.types';

export type Stage6Props = {
    words: Word[];
    onComplete: () => void;
};

export type LetterState = {
    letter: string;
    selected: boolean;
};
