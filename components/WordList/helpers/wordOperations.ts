import type { Word } from '../WordList';

export const createOptimisticWordUpdate = (
    word: Word,
    newStatus: 'LEARNED' | 'NOT_LEARNED',
) => {
    return { ...word, status: newStatus };
};

export const createDeletedWordEntry = (word: Word) => {
    return word;
};
