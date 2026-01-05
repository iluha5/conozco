/**
 * Ключи для localStorage и sessionStorage
 */
export const STORAGE_KEYS = {
    // localStorage
    TRAINING_PROGRESS: 'flashcards_training_progress',
    // sessionStorage
    TRAINING_FROM_SETUP: 'training_from_setup',
    TRAINING_WORD_SOURCE: 'training_word_source', // 'LEARNED' | 'NOT_LEARNED'
    // Events
    TRAINING_STORAGE_CHANGE_EVENT: 'training-storage-changed',
} as const;
