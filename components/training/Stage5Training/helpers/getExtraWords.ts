import type { Word } from '../typing';

export function getExtraWords(
    currentPronoun: string,
    languageCode: string,
    currentPhraseWords: string[],
    words: Word[],
): string[] {
    // Собираем все слова из всех фраз всех слов
    const allWordsFromPhrases: string[] = [];

    words.forEach(word => {
        if (!word.baseWord) return;

        // Собираем слова из примеров
        if (word.baseWord.examples) {
            word.baseWord.examples.forEach(example => {
                allWordsFromPhrases.push(
                    ...example.example
                        .split(' ')
                        .map(word =>
                            word.toLowerCase().replace(/[¿?¡!.,;:]/g, ''),
                        ),
                );
            });
        }

        // Собираем слова из грамматических примеров
        if (word.baseWord.grammaticalExamples) {
            word.baseWord.grammaticalExamples.forEach(example => {
                allWordsFromPhrases.push(
                    ...example.example
                        .split(' ')
                        .map(word =>
                            word.toLowerCase().replace(/[¿?¡!.,;:]/g, ''),
                        ),
                );
            });
        }
    });

    // Фильтруем слова, исключая слова из текущей фразы и местоимения
    const filteredWords = allWordsFromPhrases.filter(word => {
        return (
            !currentPhraseWords.includes(word) &&
            word.length > 1 &&
            ![
                'the',
                'a',
                'an',
                'and',
                'or',
                'but',
                'in',
                'on',
                'at',
                'to',
                'for',
                'of',
                'with',
                'by',
                'from',
                'up',
                'down',
                'over',
                'under',
                'into',
                'onto',
                'out',
                'off',
                'through',
                'during',
                'before',
                'after',
                'above',
                'below',
                'between',
                'among',
                'throughout',
                'against',
                'along',
                'around',
                'behind',
                'beside',
                'near',
                'next',
                'inside',
                'outside',
                'within',
                'without',
                'across',
            ].includes(word)
        );
    });

    // Убираем дубликаты
    const uniqueWords = Array.from(new Set(filteredWords));

    // Выбираем 5 случайных слов
    const shuffled = uniqueWords.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
}
