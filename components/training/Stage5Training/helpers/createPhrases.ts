import type { Word, Phrase } from '../typing';

export function createPhrases(
    words: Word[],
    sentencesPerWord: number,
): Phrase[][] {
    return words.map(word => {
        if (!word.baseWord) return [];

        const allPhrases: Phrase[] = [];

        // Добавляем простые примеры
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

        // Добавляем грамматические примеры
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

        // Ограничиваем до выбранного количества предложений, но не больше доступных
        return allPhrases.slice(0, sentencesPerWord);
    });
}
