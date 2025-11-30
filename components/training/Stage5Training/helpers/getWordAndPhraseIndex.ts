import type { Phrase } from '../typing';

export function getWordAndPhraseIndex(
    exerciseIndex: number,
    wordPhrases: Phrase[][],
): { wordIndex: number; phraseIndex: number } | null {
    let accumulated = 0;
    for (let wordIndex = 0; wordIndex < wordPhrases.length; wordIndex++) {
        const phrasesCount = wordPhrases[wordIndex].length;
        if (exerciseIndex < accumulated + phrasesCount) {
            return {
                wordIndex,
                phraseIndex: exerciseIndex - accumulated,
            };
        }
        accumulated += phrasesCount;
    }
    return null;
}
