export type TrainingStageId = 1 | 2 | 3 | 4 | 5 | 6;

export interface TrainingStage {
    id: TrainingStageId;
    nameKey: string;
    descriptionKey: string;
    hasSettings: boolean;
}

export const TRAINING_STAGES: readonly TrainingStage[] = [
    {
        id: 1,
        nameKey: 'Stage {{number}}',
        descriptionKey: 'View and memorize',
        hasSettings: true,
    },
    {
        id: 2,
        nameKey: 'Stage {{number}}',
        descriptionKey: 'Select correct translation',
        hasSettings: false,
    },
    {
        id: 3,
        nameKey: 'Stage {{number}}',
        descriptionKey: 'Match words',
        hasSettings: false,
    },
    {
        id: 4,
        nameKey: 'Stage {{number}}',
        descriptionKey: 'Word building from letters',
        hasSettings: true,
    },
    {
        id: 5,
        nameKey: 'Stage {{number}}',
        descriptionKey: 'Build a sentence from words',
        hasSettings: true,
    },
    {
        id: 6,
        nameKey: 'Stage {{number}}',
        descriptionKey: 'Build word from voice',
        hasSettings: false,
    },
] as const;

export const STAGES_WITH_SETTINGS: readonly TrainingStageId[] = [
    1, 4, 5,
] as const;
