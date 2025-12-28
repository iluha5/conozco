import { Zap, Target, Flame, FileText, Settings } from 'lucide-react';
import { TrainingModeConfig } from '../types/typing';
import floatingCogsPattern from '@/components/flash-cards-review/images/patterns/floating-cogs.svg';

const getPatternUrl = (pattern: any): string => {
    if (typeof pattern === 'string') {
        return pattern;
    }
    return pattern?.src || pattern?.default || pattern;
};

export const getNewWordsTrainingModes = (
    t: (_key: string, _params?: Record<string, string | number>) => string,
): TrainingModeConfig[] => [
    {
        id: 'quick',
        title: t('Quick'),
        shortDescription: t('Quick review of last 10 words'),
        detailedDescription: t(
            'Mode for quick review of recently added words:\n• 4 main stages\n• Words: 10 last added\n• Settings at minimum for quick completion',
        ),
        icon: Zap,
        gradient: 'from-green-400 to-emerald-500',
        enabledStages: [1, 2, 3, 4],
        wordCount: 10,
        settings: {
            stage1: { showExamples: false },
            stage4: { difficulty: 'easy' },
        },
        wordSource: 'notLearned',
        modeType: 'training',
    },
    {
        id: 'medium',
        title: t('Medium'),
        shortDescription: t('Full set of stages with basic settings'),
        detailedDescription: t(
            'Balanced training with full set of stages:\n• All available stages\n• Words: 10 last added\n• Minimum difficulty settings',
        ),
        icon: Target,
        gradient: 'from-blue-400 to-cyan-500',
        enabledStages: [1, 2, 3, 4, 5, 6],
        wordCount: 10,
        settings: {
            stage1: { showExamples: false },
            stage4: { difficulty: 'easy' },
            stage5: { sentencesPerWord: 1 },
        },
        wordSource: 'notLearned',
        modeType: 'training',
    },
    {
        id: 'hard',
        title: t('Hard'),
        shortDescription: t('Intensive training with increased difficulty'),
        detailedDescription: t(
            'Intensive training for deep learning:\n• Stages: All available stages with increased difficulty\n• Words: 10 last added',
        ),
        icon: Flame,
        gradient: 'from-red-400 to-orange-500',
        enabledStages: [1, 2, 3, 4, 5, 6],
        wordCount: 10,
        settings: {
            stage1: { showExamples: true },
            stage4: { difficulty: 'hard' },
            stage5: { sentencesPerWord: 3 },
        },
        wordSource: 'notLearned',
        modeType: 'training',
    },
    {
        id: 'sentences',
        title: t('Sentences'),
        shortDescription: t('Focus on sentence creation practice'),
        detailedDescription: t(
            'Focus on sentence creation practice:\n• Word review and simple sentence creation in main tenses\n• Words: 5 last added',
        ),
        icon: FileText,
        gradient: 'from-purple-400 to-pink-500',
        enabledStages: [1, 5],
        wordCount: 5,
        settings: {
            stage1: { showExamples: false },
            stage5: { sentencesPerWord: 5 },
        },
        wordSource: 'notLearned',
        modeType: 'training',
    },
    {
        id: 'custom',
        title: t('Custom'),
        shortDescription: t('Full customization to your needs'),
        detailedDescription: t(
            'Full customization to your needs:\n• Choose any stages\n• Any number of words\n• Flexible settings for each stage\n• Save settings for future',
        ),
        icon: Settings,
        gradient: 'from-gray-400 to-slate-500',
        backgroundPattern: getPatternUrl(floatingCogsPattern),
        enabledStages: [1, 2, 3, 4, 5, 6],
        wordCount: 0,
        settings: {},
        wordSource: 'notLearned',
        modeType: 'training',
    },
];
