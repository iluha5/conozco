import { Word } from '@/types/training.types';
import { shuffle } from 'lodash-es';
import { tServerSync } from '@/lib/i18n';

// Returns the user's preferred translation: customTranslations[0] takes priority over baseWord.translations[0].
export function getWordTranslation(word: Word, lang: string = 'en'): string {
    if (word.customTranslations && word.customTranslations.length > 0) {
        return word.customTranslations[0].translation;
    }
    if (word.baseWord?.translations && word.baseWord.translations.length > 0) {
        return word.baseWord.translations[0].translation;
    }
    return tServerSync('No translation', lang);
}

export function getWordText(word: Word): string {
    return word.baseWord?.word || word.customWord || '';
}

export function getAllTranslations(word: Word): string[] {
    const translations: string[] = [];

    if (word.customTranslations && word.customTranslations.length > 0) {
        translations.push(...word.customTranslations.map(t => t.translation));
    }

    if (word.baseWord?.translations) {
        translations.push(
            ...word.baseWord.translations.map(t => t.translation),
        );
    }

    return translations;
}

export function hasExamples(word: Word): boolean {
    if (!word.baseWord) return false;

    const hasRegularExamples =
        word.baseWord.examples && word.baseWord.examples.length > 0;
    const hasGrammaticalExamples =
        word.baseWord.grammaticalExamples &&
        word.baseWord.grammaticalExamples.length > 0;

    return hasRegularExamples || hasGrammaticalExamples;
}

const SPEECH_LANGUAGE_CODE_MAP: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-BR',
    ru: 'ru-RU',
};

export function getSpeechLanguageCode(languageCode: string): string {
    return SPEECH_LANGUAGE_CODE_MAP[languageCode] || 'en-US';
}

export function shuffleArray<T>(array: T[]): T[] {
    return shuffle(array);
}
