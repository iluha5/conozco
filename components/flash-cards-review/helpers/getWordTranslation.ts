import { Word } from '@/types/training.types';
import { tServerSync } from '@/lib/i18n';

// Priority: customTranslations -> baseWord.translations
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
