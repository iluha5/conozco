import { ListChecks, GraduationCap } from 'lucide-react';
import { TrainingModeConfig } from '../types/typing';
import { A1_GROUP_ID, A1_GROUP_NAME } from '@/config/training-modes';
import { I18n } from '@/lib/i18n';

export const getTestTrainingModes = (t: I18n['t']): TrainingModeConfig[] => [
    {
        id: 'learned-group-check',
        title: t('Group check'),
        shortDescription: t('Select a group to check'),
        detailedDescription: t(
            'Check words from selected group through flashcards',
        ),
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
        title: t('Test A1 (easy)'),
        shortDescription: t('10 random words from A1'),
        detailedDescription: t('Check 10 random words from group "{{name}}"', {
            name: A1_GROUP_NAME,
        }),
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
        title: t('Test A1 (medium)'),
        shortDescription: t('20 random words from A1'),
        detailedDescription: t('Check 20 random words from group "{{name}}"', {
            name: A1_GROUP_NAME,
        }),
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
