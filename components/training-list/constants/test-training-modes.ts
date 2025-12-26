import { ListChecks, GraduationCap } from 'lucide-react';
import { TrainingModeConfig } from '../types/typing';
import { A1_GROUP_ID, A1_GROUP_NAME } from '@/config/training-modes';

export const TEST_TRAINING_MODES: TrainingModeConfig[] = [
    {
        id: 'learned-group-check',
        title: 'Проверка по группам',
        shortDescription: 'Выберите группу для проверки',
        detailedDescription: 'Проверка слов из выбранной группы через карточки',
        icon: ListChecks,
        gradient: 'from-blue-400 to-cyan-500',
        enabledStages: [],
        wordCount: 20,
        settings: {},
        wordSource: 'group',
        modeType: 'flashCards',
    },
    {
        id: 'learned-test-a1-easy',
        title: 'Тест A1 (лёгкий)',
        shortDescription: '10 случайных слов из A1',
        detailedDescription: `Проверка 10 случайных слов из группы "${A1_GROUP_NAME}"`,
        icon: GraduationCap,
        gradient: 'from-orange-400 to-red-500',
        enabledStages: [],
        wordCount: 10,
        settings: {},
        wordSource: 'group',
        modeType: 'flashCards',
        groupId: A1_GROUP_ID,
        groupName: A1_GROUP_NAME,
    },
    {
        id: 'learned-test-a1-medium',
        title: 'Тест A1 (средний)',
        shortDescription: '20 случайных слов из A1',
        detailedDescription: `Проверка 20 случайных слов из группы "${A1_GROUP_NAME}"`,
        icon: GraduationCap,
        gradient: 'from-red-400 to-rose-500',
        enabledStages: [],
        wordCount: 20,
        settings: {},
        wordSource: 'group',
        modeType: 'flashCards',
        groupId: A1_GROUP_ID,
        groupName: A1_GROUP_NAME,
    },
];

