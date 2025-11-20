export type TrainingStageId = 1 | 2 | 3 | 4 | 5 | 6;

export interface TrainingStage {
    id: TrainingStageId;
    name: string;
    description: string;
    hasSettings: boolean;
}

export const TRAINING_STAGES: readonly TrainingStage[] = [
    {
        id: 1,
        name: 'Этап 1',
        description: 'Просмотр + озвучка',
        hasSettings: true,
    },
    {
        id: 2,
        name: 'Этап 2',
        description: 'Выбор перевода',
        hasSettings: false,
    },
    {
        id: 3,
        name: 'Этап 3',
        description: 'Сопоставление',
        hasSettings: false,
    },
    {
        id: 4,
        name: 'Этап 4',
        description: 'Составление слова',
        hasSettings: true,
    },
    {
        id: 5,
        name: 'Этап 5',
        description: 'Составление предложения',
        hasSettings: true,
    },
    {
        id: 6,
        name: 'Этап 6',
        description: 'Составление по голосу',
        hasSettings: false,
    },
] as const;

export const STAGE_DESCRIPTIONS: Record<TrainingStageId, string> = {
    1: 'Просмотр + озвучка',
    2: 'Выбор перевода',
    3: 'Сопоставление',
    4: 'Составление слова',
    5: 'Составление предложения',
    6: 'Составление по голосу',
} as const;

export const STAGES_WITH_SETTINGS: readonly TrainingStageId[] = [
    1, 4, 5,
] as const;
