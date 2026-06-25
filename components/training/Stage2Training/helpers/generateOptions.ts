import { getWordTranslation } from '@/lib/training-utils';
import { tServerSync } from '@/lib/i18n/utils/tServerSync';
import type { Word } from '@/types/training.types';

/**
 * Generate translation options for a word
 * Returns an array of 4 options: 3 wrong translations + 1 correct translation
 */
export function generateOptions(
    currentWord: Word,
    currentIndex: number,
    allWords: Word[],
    lang: string = 'en',
): string[] {
    const correctTranslation = getWordTranslation(currentWord);
    const otherWords = allWords.filter((word, index) => index !== currentIndex);
    const noTranslationText = tServerSync('No translation', lang);

    // Select 3 random incorrect answers
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
    const wrongOptions = shuffledOthers
        .slice(0, 3)
        .map(word => getWordTranslation(word))
        .filter(
            translation =>
                translation !== correctTranslation &&
                translation !== noTranslationText,
        );

    // Add correct answer and shuffle
    const allOptions = [...wrongOptions, correctTranslation].sort(
        () => Math.random() - 0.5,
    );

    return allOptions;
}
