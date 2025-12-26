import { TrainingModeGroupId } from '../types/typing';
import { Word } from '@/types/training.types';

export interface TabColorScheme {
    active: {
        text: string;
        border: string;
        after: string;
    };
    inactive: {
        text: string;
        hover: {
            text: string;
            bg: string;
        };
    };
    badge: {
        active: {
            bg: string;
            text: string;
            border: string;
        };
        inactive: {
            bg: string;
            text: string;
            border: string;
        };
    };
}

export interface TabConfig {
    id: TrainingModeGroupId;
    title: string;
    hash: string;
    colorScheme: TabColorScheme;
    showBadge: boolean;
    getBadgeCount?: (words: Word[]) => number;
}

export const TABS_CONFIG: TabConfig[] = [
    {
        id: 'new',
        title: 'Новые слова',
        hash: '',
        showBadge: true,
        colorScheme: {
            active: {
                text: 'text-purple-700',
                border: 'border-purple-600',
                after: 'bg-purple-600',
            },
            inactive: {
                text: 'text-gray-500',
                hover: {
                    text: 'hover:text-gray-700',
                    bg: 'hover:bg-gray-50',
                },
            },
            badge: {
                active: {
                    bg: 'bg-purple-100',
                    text: 'text-purple-700',
                    border: 'border-purple-200',
                },
                inactive: {
                    bg: 'bg-gray-100',
                    text: 'text-gray-600',
                    border: 'border-gray-200',
                },
            },
        },
        getBadgeCount: (words: Word[]) =>
            words.filter(w => w.status === 'NOT_LEARNED').length,
    },
    {
        id: 'learned',
        title: 'Закрепление',
        hash: 'learned',
        showBadge: true,
        colorScheme: {
            active: {
                text: 'text-pink-700',
                border: 'border-pink-600',
                after: 'bg-pink-600',
            },
            inactive: {
                text: 'text-gray-500',
                hover: {
                    text: 'hover:text-gray-700',
                    bg: 'hover:bg-gray-50',
                },
            },
            badge: {
                active: {
                    bg: 'bg-pink-100',
                    text: 'text-pink-700',
                    border: 'border-pink-200',
                },
                inactive: {
                    bg: 'bg-gray-100',
                    text: 'text-gray-600',
                    border: 'border-gray-200',
                },
            },
        },
        getBadgeCount: (words: Word[]) =>
            words.filter(w => w.status === 'LEARNED').length,
    },
];

