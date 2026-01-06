import { GraduationCap } from 'lucide-react';

/**
 * Конфигурация тестов по языкам обучения
 * Каждый тест привязан к конкретному языку и группе слов
 */
export type TestDifficulty = 'easy' | 'medium';

/**
 * Цветовая схема для тестов уровней A1, A2, B1, B2
 * Используется зеленая гамма с прогрессией оттенков от светлого (A1) к темному (B2)
 */
const LEVEL_GRADIENTS = {
    A1: 'from-green-300 to-green-400',
    A2: 'from-green-400 to-green-500',
    B1: 'from-green-500 to-green-600',
    B2: 'from-green-600 to-green-700',
} as const;

/**
 * Получить градиент для уровня теста
 */
function getGradientForLevel(level: 'A1' | 'A2' | 'B1' | 'B2'): string {
    return LEVEL_GRADIENTS[level];
}

/**
 * Определить уровень теста из его ID
 */
function getLevelFromTestId(testId: string): 'A1' | 'A2' | 'B1' | 'B2' {
    if (testId.includes('-a1-')) return 'A1';
    if (testId.includes('-a2-')) return 'A2';
    if (testId.includes('-b1-')) return 'B1';
    if (testId.includes('-b2-')) return 'B2';
    return 'A1'; // Fallback
}

export interface TestConfig {
    /** Уникальный ID теста (например, 'learned-test-es-a1-easy') */
    id: string;
    /** Код языка обучения ('es' для испанского, 'en' для английского) */
    languageCode: string;
    /** ID группы слов в БД */
    groupId: number;
    /** Уровень сложности теста */
    difficulty: TestDifficulty;
    /** Количество слов в тесте */
    wordCount: number;
    /** Градиент для карточки */
    gradient: string;
    /** Иконка для карточки */
    icon: typeof GraduationCap;
}

/**
 * Базовая конфигурация всех тестов
 * Названия групп будут загружаться динамически из БД
 */
export const TEST_CONFIGS: TestConfig[] = [
    // Испанский язык - A1
    {
        id: 'learned-test-es-a1-easy',
        languageCode: 'es',
        groupId: 4, // A1: All words (испанский)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-es-a1-easy'),
        ),
        icon: GraduationCap,
    },
    // Испанский язык - A2
    {
        id: 'learned-test-es-a2-easy',
        languageCode: 'es',
        groupId: 28, // A2: Todas las Palabras (испанский)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-es-a2-easy'),
        ),
        icon: GraduationCap,
    },
    // Испанский язык - B1
    {
        id: 'learned-test-es-b1-easy',
        languageCode: 'es',
        groupId: 43, // B1: Todas las Palabras (испанский)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-es-b1-easy'),
        ),
        icon: GraduationCap,
    },
    // Испанский язык - B2
    {
        id: 'learned-test-es-b2-easy',
        languageCode: 'es',
        groupId: 66, // B2: Todas las Palabras (испанский)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-es-b2-easy'),
        ),
        icon: GraduationCap,
    },
    // Английский язык - A1
    {
        id: 'learned-test-en-a1-easy',
        languageCode: 'en',
        groupId: 27, // A1: All Word (английский)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-en-a1-easy'),
        ),
        icon: GraduationCap,
    },
    // Английский язык - A2
    {
        id: 'learned-test-en-a2-easy',
        languageCode: 'en',
        groupId: 108, // A2: All Words (английский)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-en-a2-easy'),
        ),
        icon: GraduationCap,
    },
];

/**
 * Получить конфигурации тестов для указанного языка
 */
export function getTestConfigsForLanguage(languageCode: string): TestConfig[] {
    return TEST_CONFIGS.filter(config => config.languageCode === languageCode);
}

/**
 * Получить конфигурацию теста по ID
 */
export function getTestConfigById(testId: string): TestConfig | undefined {
    return TEST_CONFIGS.find(config => config.id === testId);
}
