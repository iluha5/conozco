import { Word } from '@/types/training.types';

/**
 * Получить перевод слова для проверки
 * Приоритет: customTranslations -> baseWord.translations
 */
export function getWordTranslation(word: Word): string {
    if (word.customTranslations && word.customTranslations.length > 0) {
        return word.customTranslations[0].translation;
    }

    if (word.baseWord?.translations && word.baseWord.translations.length > 0) {
        return word.baseWord.translations[0].translation;
    }

    return 'Нет перевода';
}

/**
 * Получить текст слова (baseWord.word или customWord)
 */
export function getWordText(word: Word): string {
    return word.baseWord?.word || word.customWord || '';
}
