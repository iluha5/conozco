/**
 * Утилиты для работы со словами
 */

// Мапа частей речи: name -> человеко-читаемое название
export const PART_OF_SPEECH_DISPLAY_NAMES: Record<string, string> = {
    NOUN: 'Noun',
    VERB: 'Verb',
    ADJECTIVE: 'Adjective',
    ADVERB: 'Adverb',
    PRONOUN: 'Pronoun',
    PREPOSITION: 'Preposition',
    CONJUNCTION: 'Conjunction',
    INTERJECTION: 'Interjection',
    ARTICLE: 'Article',
    DETERMINER: 'Determiner',
    NUMERAL: 'Numeral',
    PHRASE: 'Phrase',
};

// Мапа частей речи: name -> аббревиатура
export const PART_OF_SPEECH_ABBREVIATIONS: Record<string, string> = {
    NOUN: 'n',
    VERB: 'v',
    ADJECTIVE: 'adj',
    ADVERB: 'adv',
    PRONOUN: 'pron',
    PREPOSITION: 'prep',
    CONJUNCTION: 'conj',
    INTERJECTION: 'int',
    ARTICLE: 'art',
    DETERMINER: 'det',
    NUMERAL: 'num',
    PHRASE: 'phr',
};

type Translation = {
    translation: string;
    priority?: number;
};

type CustomTranslation = {
    id: number;
    translation: string;
    [key: string]: any; // Остальные поля не важны для этой функции
};

/**
 * Получить текущий перевод слова
 * Приоритет: кастомный перевод -> базовый перевод
 */
export function getCurrentTranslation(
    customTranslations?: CustomTranslation[],
    baseTranslations?: Translation[],
): string {
    if (customTranslations && customTranslations.length > 0) {
        return customTranslations[0].translation;
    }
    if (baseTranslations && baseTranslations.length > 0) {
        return baseTranslations[0].translation;
    }
    // This function is used in various contexts, so we return English fallback
    // Components should use useTranslation hook for proper localization
    return 'No translation';
}

/**
 * Получить флаг языка по коду
 */
export function getLanguageFlag(languageCode: string): string {
    const flags: Record<string, string> = {
        en: '🇬🇧',
        es: '🇪🇸',
        fr: '🇫🇷',
        de: '🇩🇪',
        it: '🇮🇹',
        ru: '🇷🇺',
    };
    return flags[languageCode] || '🌐';
}

/**
 * Получить аббревиатуру части речи по имени
 */
export function getPartOfSpeechAbbrev(partOfSpeechName: string): string {
    return (
        PART_OF_SPEECH_ABBREVIATIONS[partOfSpeechName] ||
        partOfSpeechName.substring(0, 3)
    );
}

/**
 * Получить человеко-читаемое название части речи
 */
export function getPartOfSpeechDisplayName(partOfSpeechName: string): string {
    return PART_OF_SPEECH_DISPLAY_NAMES[partOfSpeechName] || partOfSpeechName;
}

/**
 * Получить текст с количеством переводов
 * Формат: "(5)" или "(5+1)" если есть кастомный перевод
 */
export function getTranslationsCountText(
    baseTranslationsCount: number,
    hasCustomTranslation: boolean,
): string {
    if (baseTranslationsCount === 0 && !hasCustomTranslation) {
        return '';
    }

    const customPart = hasCustomTranslation ? '+1' : '';
    return `(${baseTranslationsCount}${customPart})`;
}

/**
 * Проверить, есть ли у слова переводы
 */
export function hasTranslations(
    customTranslations?: CustomTranslation[],
    baseTranslations?: Translation[],
): boolean {
    return !!(
        (customTranslations && customTranslations.length > 0) ||
        (baseTranslations && baseTranslations.length > 0)
    );
}
