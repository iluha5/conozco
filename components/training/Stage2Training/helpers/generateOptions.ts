import { getWordTranslation } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';

/**
 * Generate translation options for a word
 * Returns an array of 4 options: 3 wrong translations + 1 correct translation
 */
export function generateOptions(
    currentWord: Word,
    currentIndex: number,
    allWords: Word[],
): string[] {
    const correctTranslation = getWordTranslation(currentWord);
    const otherWords = allWords.filter((word, index) => index !== currentIndex);

    // Выбираем 3 случайных неправильных ответа
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
    const wrongOptions = shuffledOthers
        .slice(0, 3)
        .map(word => getWordTranslation(word))
        .filter(
            translation =>
                translation !== correctTranslation &&
                translation !== 'Нет перевода',
        );

    // Добавляем правильный ответ и перемешиваем
    const allOptions = [...wrongOptions, correctTranslation].sort(
        () => Math.random() - 0.5,
    );

    return allOptions;
}
