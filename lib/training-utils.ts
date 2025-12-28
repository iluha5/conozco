/**
 * Утилиты для работы с тренировочными данными
 */

import { Word } from '@/types/training.types';
import { shuffle } from 'lodash-es';
import { tServerSync } from '@/lib/i18n';

/**
 * Получить перевод слова (приоритет: customTranslations -> baseWord.translations)
 * @param word - слово
 * @param lang - язык интерфейса (по умолчанию 'en')
 */
export function getWordTranslation(word: Word, lang: string = 'en'): string {
    if (word.customTranslations && word.customTranslations.length > 0) {
        return word.customTranslations[0].translation;
    }
    if (word.baseWord?.translations && word.baseWord.translations.length > 0) {
        return word.baseWord.translations[0].translation;
    }
    return tServerSync('No translation', lang);
}

/**
 * Получить текст слова (baseWord.word или customWord)
 */
export function getWordText(word: Word): string {
    return word.baseWord?.word || word.customWord || '';
}

/**
 * Получить все переводы слова
 */
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

/**
 * Проверить, есть ли у слова примеры
 */
export function hasExamples(word: Word): boolean {
    if (!word.baseWord) return false;

    const hasRegularExamples =
        word.baseWord.examples && word.baseWord.examples.length > 0;
    const hasGrammaticalExamples =
        word.baseWord.grammaticalExamples &&
        word.baseWord.grammaticalExamples.length > 0;

    return hasRegularExamples || hasGrammaticalExamples;
}

/**
 * Получить код языка для speech synthesis
 */
export function getSpeechLanguageCode(languageCode: string): string {
    const languageMap: Record<string, string> = {
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        it: 'it-IT',
        pt: 'pt-BR',
        ru: 'ru-RU',
    };

    return languageMap[languageCode] || 'en-US';
}

/**
 * Перемешать массив используя lodash-es shuffle (алгоритм Fisher-Yates)
 * Создает новый массив, не изменяя исходный
 * @param array - массив для перемешивания
 * @returns новый перемешанный массив
 */
export function shuffleArray<T>(array: T[]): T[] {
    return shuffle(array);
}
