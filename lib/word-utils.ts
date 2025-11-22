/**
 * Утилиты для работы со словами
 */

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
    return 'Нет перевода';
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
 * Получить аббревиатуру части речи
 */
export function getPartOfSpeechAbbrev(displayName: string): string {
    const abbreviations: Record<string, string> = {
        существительное: 'сущ',
        глагол: 'гл',
        прилагательное: 'пр',
        наречие: 'нар',
        местоимение: 'мест',
        предлог: 'пред',
        союз: 'союз',
        частица: 'част',
        междометие: 'межд',
        noun: 'n',
        verb: 'v',
        adjective: 'adj',
        adverb: 'adv',
        pronoun: 'pron',
        preposition: 'prep',
        conjunction: 'conj',
        particle: 'part',
        interjection: 'int',
    };
    return (
        abbreviations[displayName.toLowerCase()] || displayName.substring(0, 3)
    );
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
