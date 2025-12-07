import { Word } from '@/types/training.types';

/**
 * Получить последние добавленные слова для текущего языка
 */
export function getLastAddedWords(
    words: Word[],
    languageId: number,
    count: number,
): Word[] {
    return words
        .filter(
            word =>
                word.languageId === String(languageId) &&
                word.status !== 'LEARNED',
        )
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        })
        .slice(0, count);
}
