import { Word } from '@/types/training.types';
import { STORAGE_KEYS } from '@/config/storage-keys';

interface TrainingWordsCache {
    wordIds: string[];
    words: Word[];
}

export function saveTrainingWordsCache(words: Word[]): void {
    if (typeof window === 'undefined' || words.length === 0) {
        return;
    }

    const cache: TrainingWordsCache = {
        wordIds: words.map(word => String(word.id)),
        words,
    };

    sessionStorage.setItem(
        STORAGE_KEYS.TRAINING_WORDS_CACHE,
        JSON.stringify(cache),
    );
}

export function readTrainingWordsCache(
    expectedWordIds: string[],
): Word[] | null {
    if (typeof window === 'undefined' || expectedWordIds.length === 0) {
        return null;
    }

    const raw = sessionStorage.getItem(STORAGE_KEYS.TRAINING_WORDS_CACHE);
    if (!raw) {
        return null;
    }

    try {
        const cache = JSON.parse(raw) as TrainingWordsCache;
        const expectedSet = new Set(expectedWordIds.map(String));
        const cacheSet = new Set(cache.wordIds.map(String));

        if (expectedSet.size !== cacheSet.size) {
            return null;
        }

        for (const wordId of Array.from(expectedSet)) {
            if (!cacheSet.has(wordId)) {
                return null;
            }
        }

        return cache.words;
    } catch {
        return null;
    }
}

export function clearTrainingWordsCache(): void {
    if (typeof window === 'undefined') {
        return;
    }

    sessionStorage.removeItem(STORAGE_KEYS.TRAINING_WORDS_CACHE);
}
