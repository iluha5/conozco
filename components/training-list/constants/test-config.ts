import { GraduationCap } from 'lucide-react';

/**
 * Конфигурация тестов по языкам обучения
 * Каждый тест привязан к конкретному языку и группе слов
 */
export type TestDifficulty = 'easy' | 'medium';

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
        gradient: 'from-orange-400 to-red-500',
        icon: GraduationCap,
    },
    // Испанский язык - A2
    {
        id: 'learned-test-es-a2-easy',
        languageCode: 'es',
        groupId: 28, // A2: Todas las Palabras (испанский)
        difficulty: 'easy',
        wordCount: 20,
        gradient: 'from-orange-400 to-red-500',
        icon: GraduationCap,
    },
    // Английский язык - A1
    {
        id: 'learned-test-en-a1-easy',
        languageCode: 'en',
        groupId: 27, // A1: All Word (английский)
        difficulty: 'easy',
        wordCount: 20,
        gradient: 'from-orange-400 to-red-500',
        icon: GraduationCap,
    },
    // Английский язык - A2
    {
        id: 'learned-test-en-a2-easy',
        languageCode: 'en',
        groupId: 108, // A2: All Words (английский)
        difficulty: 'easy',
        wordCount: 20,
        gradient: 'from-orange-400 to-red-500',
        icon: GraduationCap,
    },
];

/**
 * Получить конфигурации тестов для указанного языка
 */
export function getTestConfigsForLanguage(
    languageCode: string,
): TestConfig[] {
    return TEST_CONFIGS.filter(config => config.languageCode === languageCode);
}

/**
 * Получить конфигурацию теста по ID
 */
export function getTestConfigById(testId: string): TestConfig | undefined {
    return TEST_CONFIGS.find(config => config.id === testId);
}

