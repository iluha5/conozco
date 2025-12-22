import { Word } from '@/types/training.types';

/**
 * Получить последние добавленные слова для текущего языка
 * @param words - Массив всех слов
 * @param languageId - ID языка для фильтрации
 * @param count - Количество слов
 * @param status - Статус слов (опционально, по умолчанию только NOT_LEARNED)
 */
export function getLastAddedWords(
    words: Word[],
    languageId: number,
    count: number,
    status?: 'LEARNED' | 'NOT_LEARNED',
): Word[] {
    return words
        .filter(word => {
            const matchesLanguage = Number(word.languageId) === languageId;
            const matchesStatus = status
                ? word.status === status
                : word.status !== 'LEARNED';
            return matchesLanguage && matchesStatus;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        })
        .slice(0, count);
}

/**
 * Получить случайные изученные слова
 */
export function getRandomLearnedWords(
    words: Word[],
    languageId: number,
    count: number,
): Word[] {
    const learnedWords = words.filter(
        word =>
            Number(word.languageId) === languageId && word.status === 'LEARNED',
    );

    // Fisher-Yates shuffle
    const shuffled = [...learnedWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
}
