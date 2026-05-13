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
    [key: string]: any;
};

// Custom (user-supplied) translation wins over the base translation list.
// Callers in localized contexts should resolve "No translation" via useTranslation themselves.
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
    return 'No translation';
}

const LANGUAGE_FLAGS: Record<string, string> = {
    en: '🇬🇧',
    es: '🇪🇸',
    fr: '🇫🇷',
    de: '🇩🇪',
    it: '🇮🇹',
    ru: '🇷🇺',
};

export function getLanguageFlag(languageCode: string): string {
    return LANGUAGE_FLAGS[languageCode] || '🌐';
}

export function getPartOfSpeechAbbrev(partOfSpeechName: string): string {
    return (
        PART_OF_SPEECH_ABBREVIATIONS[partOfSpeechName] ||
        partOfSpeechName.substring(0, 3)
    );
}

export function getPartOfSpeechDisplayName(partOfSpeechName: string): string {
    return PART_OF_SPEECH_DISPLAY_NAMES[partOfSpeechName] || partOfSpeechName;
}

// Renders "(N)" or "(N+1)" if a custom translation also exists.
export function getTranslationsCountText(
    baseTranslationsCount: number,
    hasCustomTranslation: boolean,
): string {
    if (baseTranslationsCount === 0 && !hasCustomTranslation) return '';
    return `(${baseTranslationsCount}${hasCustomTranslation ? '+1' : ''})`;
}

export function hasTranslations(
    customTranslations?: CustomTranslation[],
    baseTranslations?: Translation[],
): boolean {
    return !!(
        (customTranslations && customTranslations.length > 0) ||
        (baseTranslations && baseTranslations.length > 0)
    );
}
