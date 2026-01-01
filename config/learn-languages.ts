/**
 * Конфигурация языков, доступных для обучения
 */

export type LearnLanguageCode = 'en' | 'es';

/**
 * Массив кодов языков, доступных для обучения
 * Для добавления нового языка просто добавьте его код в этот массив
 */
export const AVAILABLE_LEARN_LANGUAGES: readonly LearnLanguageCode[] = [
    'en',
    'es',
] as const;

/**
 * Проверяет, доступен ли язык для обучения
 */
export function isLearnLanguageAvailable(
    code: string,
): code is LearnLanguageCode {
    return AVAILABLE_LEARN_LANGUAGES.includes(code as LearnLanguageCode);
}
