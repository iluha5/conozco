import { Zap, Target, Flame, FileText, Settings } from 'lucide-react';
import { TrainingModeConfig } from '../types/typing';
import floatingCogsPattern from '@/components/flash-cards-review/images/patterns/floating-cogs.svg';

const getPatternUrl = (pattern: any): string => {
    if (typeof pattern === 'string') {
        return pattern;
    }
    return pattern?.src || pattern?.default || pattern;
};

export const NEW_WORDS_TRAINING_MODES: TrainingModeConfig[] = [
    {
        id: 'quick',
        title: 'Быстрый',
        shortDescription: 'Быстрое повторение последних 10 слов',
        detailedDescription: `Режим для быстрого повторения недавно добавленных слов:
• 4 основных этапа
• Слов: 10 последних добавленных
• Настройки на минимуме для быстрого прохождения`,
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
        title: 'Средний',
        shortDescription: 'Полный набор этапов с базовыми настройками',
        detailedDescription: `Сбалансированная тренировка с полным набором этапов:
• Все доступные этапе
• Слов: 10 последних добавленных
• Минимальные настройки сложности`,
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
        title: 'Сложный',
        shortDescription: 'Интенсивная тренировка с повышенной сложностью',
        detailedDescription: `Интенсивная тренировка для глубокого усвоения:
• Этапы: Все доступные этапе с повышенной сложностью
• Слов: 10 последних добавленных`,
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
        title: 'Предложения',
        shortDescription: 'Фокус на практике создания предложений',
        detailedDescription: `Фокус на практике создания предложений:
• Обзор слов и составление простых предложений в основных временах
• Слов: 5 последних добавленных`,
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
        title: 'Кастомный',
        shortDescription: 'Полная настройка под ваши нужды',
        detailedDescription: `Полная настройка под ваши нужды:
• Выбор любых этапов
• Любое количество слов
• Гибкая настройка каждого этапа
• Сохранение настроек на будущее`,
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

export const TRAINING_MODES = NEW_WORDS_TRAINING_MODES;
