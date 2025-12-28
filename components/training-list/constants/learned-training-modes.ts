import { BookCheck, FileText } from 'lucide-react';
import { TrainingModeConfig } from '../types/typing';
import { I18n } from '@/lib/i18n';

export const getLearnedTrainingModes = (t: I18n['t']): TrainingModeConfig[] => [
    {
        id: 'learned-quick-check',
        title: t('Quick check'),
        shortDescription: t('10 random learned words'),
        detailedDescription: t(
            'Quick check of 10 random learned words through flashcards',
        ),
        icon: BookCheck,
        gradient: 'from-green-400 to-emerald-500',
        enabledStages: [],
        wordCount: 10,
        settings: {},
        wordSource: 'learned',
        modeType: 'flashCards',
    },
    {
        id: 'learned-sentences',
        title: t('Sentence building'),
        shortDescription: t('5 words, 4 sentences per word'),
        detailedDescription: t(
            'Practice building sentences with learned words',
        ),
        icon: FileText,
        gradient: 'from-purple-400 to-pink-500',
        enabledStages: [5],
        wordCount: 5,
        settings: {
            stage5: { sentencesPerWord: 4 },
        },
        wordSource: 'learned',
        modeType: 'training',
    },
];
