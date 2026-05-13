import { GraduationCap } from 'lucide-react';

export type TestDifficulty = 'easy' | 'medium';

// Green palette progressing from A1 (light) to B2 (dark)
const LEVEL_GRADIENTS = {
    A1: 'from-green-300 to-green-400',
    A2: 'from-green-400 to-green-500',
    B1: 'from-green-500 to-green-600',
    B2: 'from-green-600 to-green-700',
} as const;

function getGradientForLevel(level: 'A1' | 'A2' | 'B1' | 'B2'): string {
    return LEVEL_GRADIENTS[level];
}

function getLevelFromTestId(testId: string): 'A1' | 'A2' | 'B1' | 'B2' {
    if (testId.includes('-a1-')) return 'A1';
    if (testId.includes('-a2-')) return 'A2';
    if (testId.includes('-b1-')) return 'B1';
    if (testId.includes('-b2-')) return 'B2';
    return 'A1';
}

export interface TestConfig {
    id: string;
    languageCode: string;
    groupId: number;
    difficulty: TestDifficulty;
    wordCount: number;
    gradient: string;
    icon: typeof GraduationCap;
}

// Group names are resolved at runtime from the DB; this list holds only ids.
export const TEST_CONFIGS: TestConfig[] = [
    // Spanish language - A1
    {
        id: 'learned-test-es-a1-easy',
        languageCode: 'es',
        groupId: 4, // A1: All words (Spanish)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-es-a1-easy'),
        ),
        icon: GraduationCap,
    },
    // Spanish language - A2
    {
        id: 'learned-test-es-a2-easy',
        languageCode: 'es',
        groupId: 28, // A2: Todas las Palabras (Spanish)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-es-a2-easy'),
        ),
        icon: GraduationCap,
    },
    // Spanish language - B1
    {
        id: 'learned-test-es-b1-easy',
        languageCode: 'es',
        groupId: 43, // B1: Todas las Palabras (Spanish)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-es-b1-easy'),
        ),
        icon: GraduationCap,
    },
    // Spanish language - B2
    {
        id: 'learned-test-es-b2-easy',
        languageCode: 'es',
        groupId: 66, // B2: Todas las Palabras (Spanish)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-es-b2-easy'),
        ),
        icon: GraduationCap,
    },
    // English language - A1
    {
        id: 'learned-test-en-a1-easy',
        languageCode: 'en',
        groupId: 27, // A1: All Word (English)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-en-a1-easy'),
        ),
        icon: GraduationCap,
    },
    // English language - A2
    {
        id: 'learned-test-en-a2-easy',
        languageCode: 'en',
        groupId: 108, // A2: All Words (English)
        difficulty: 'easy',
        wordCount: 20,
        gradient: getGradientForLevel(
            getLevelFromTestId('learned-test-en-a2-easy'),
        ),
        icon: GraduationCap,
    },
];

export function getTestConfigsForLanguage(languageCode: string): TestConfig[] {
    return TEST_CONFIGS.filter(config => config.languageCode === languageCode);
}

export function getTestConfigById(testId: string): TestConfig | undefined {
    return TEST_CONFIGS.find(config => config.id === testId);
}
