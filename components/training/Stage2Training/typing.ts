import type { Word } from '@/types/training.types';

export type Stage2Props = {
    words: Word[];
    onComplete: () => void;
};

export type SelectionState = {
    selectedOption: string | null;
    isCorrect: boolean | null;
};

export type ButtonStyleState = {
    className: string;
    variant: 'default' | 'outline' | 'secondary';
    showCheckIcon: boolean;
    showXIcon: boolean;
};
