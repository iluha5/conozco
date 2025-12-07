import { LucideIcon } from 'lucide-react';

export type TrainingModeId =
    | 'quick'
    | 'medium'
    | 'hard'
    | 'sentences'
    | 'custom';

export type TrainingModeConfig = {
    id: TrainingModeId;
    title: string;
    shortDescription: string;
    detailedDescription: string;
    icon: LucideIcon;
    gradient: string;
    backgroundPattern?: string;
    enabledStages: number[];
    wordCount: number;
    settings: {
        stage1?: { showExamples: boolean };
        stage4?: { difficulty: 'easy' | 'medium' | 'hard' };
        stage5?: { sentencesPerWord: number };
    };
};
