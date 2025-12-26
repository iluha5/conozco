import { LucideIcon } from 'lucide-react';

export type TrainingModeId =
    | 'quick'
    | 'medium'
    | 'hard'
    | 'sentences'
    | 'custom'
    // Новые режимы закрепления
    | 'learned-quick-check'
    | 'learned-group-check'
    | 'learned-sentences'
    | 'learned-test-a1-easy'
    | 'learned-test-a1-medium';

export type TrainingModeGroupId = 'new' | 'learned' | 'tests';

export type WordSource = 'notLearned' | 'learned' | 'group';
export type ModeType = 'training' | 'flashCards';

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

    // Новые поля для режимов закрепления
    wordSource: WordSource; // Источник слов
    modeType: ModeType; // Тип запуска
    groupId?: number; // ID группы для режимов с группами
    groupName?: string; // Название группы для UI
};
