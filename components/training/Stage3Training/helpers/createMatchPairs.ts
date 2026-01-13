import { getWordText, getWordTranslation } from '@/lib/training-utils';
import type { Word } from '@/types/training.types';
import type { MatchPair } from '../typing';

export function createMatchPairs(
    words: Word[],
    exerciseResults: (boolean | null)[],
    isRetryMode: boolean,
    lang: string = 'en',
): MatchPair[] {
    return words.map(word => {
        const globalIndex = words.findIndex(w => w.id === word.id);
        const hasError = exerciseResults[globalIndex] === false;

        return {
            id: word.id,
            foreign: getWordText(word),
            translation: getWordTranslation(word, lang),
            matched: false,
            errorCount: hasError && isRetryMode ? 0 : 0, // Reset error count on retry
        };
    });
}
