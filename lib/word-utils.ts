/**
 * Утилиты для работы со словами
 */

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
