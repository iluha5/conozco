/**
 * Configuration for languages available for learning
 */

export type LearnLanguageCode = 'en' | 'es';

/**
 * Language codes available for learning
 * To add a new language, append its code to this array
 */
export const AVAILABLE_LEARN_LANGUAGES: readonly LearnLanguageCode[] = [
    'en',
    'es',
] as const;

/**
 * Check whether a language is available for learning
 */
export function isLearnLanguageAvailable(
    code: string,
): code is LearnLanguageCode {
    return AVAILABLE_LEARN_LANGUAGES.includes(code as LearnLanguageCode);
}
