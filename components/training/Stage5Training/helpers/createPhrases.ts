import type { Word, Phrase } from '../typing';

export function createPhrases(
    words: Word[],
    sentencesPerWord: number,
): Phrase[][] {
    return words.map(word => {
        if (!word.baseWord) return [];

        const allPhrases: Phrase[] = [];

        if (word.baseWord.examples) {
            word.baseWord.examples.forEach(example => {
                allPhrases.push({
                    example: example.example,
                    translation: example.translation,
                    pronoun: example.pronoun.pronoun,
                    words: example.example
                        .split(' ')
                        .map(word =>
                            word.toLowerCase().replace(/[¿?¡!.,;:]/g, ''),
                        ),
                });
            });
        }

        if (word.baseWord.grammaticalExamples) {
            word.baseWord.grammaticalExamples.forEach(example => {
                allPhrases.push({
                    example: example.example,
                    translation: example.translation,
                    pronoun: example.pronoun.pronoun,
                    words: example.example
                        .split(' ')
                        .map(word =>
                            word.toLowerCase().replace(/[¿?¡!.,;:]/g, ''),
                        ),
                });
            });
        }

        return allPhrases.slice(0, sentencesPerWord);
    });
}
