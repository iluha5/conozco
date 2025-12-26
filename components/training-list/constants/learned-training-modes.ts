import { BookCheck, FileText } from 'lucide-react';
import { TrainingModeConfig } from '../types/typing';

export const LEARNED_TRAINING_MODES: TrainingModeConfig[] = [
    {
        id: 'learned-quick-check',
        title: 'Быстрая проверка',
        shortDescription: '10 случайных изученных слов',
        detailedDescription:
            'Быстрая проверка 10 случайных изученных слов через карточки',
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
        title: 'Составление предложений',
        shortDescription: '5 слов, по 4 предложения на слово',
        detailedDescription:
            'Практика составления предложений с изученными словами',
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
