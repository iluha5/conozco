import { ListChecks } from 'lucide-react';
import { TrainingModeConfig } from '../types/typing';
import { I18n } from '@/lib/i18n';

export function getGroupCheckMode(t: I18n['t']): TrainingModeConfig {
    return {
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
    };
}
