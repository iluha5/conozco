import { useState, useEffect, useMemo } from 'react';
import { createPhrases } from '../helpers/createPhrases';
import type { Word, Phrase } from '../typing';

type UseStage5PhrasesParams = {
    words: Word[];
    sentencesPerWord: number;
};

export function useStage5Phrases({
    words,
    sentencesPerWord,
}: UseStage5PhrasesParams) {
    // Фильтруем слова, у которых есть фразы
    const wordsWithPhrases = useMemo(
        () =>
            words.filter(word => {
                const baseWord = word.baseWord;
                if (!baseWord) return false;

                const hasExamples =
                    baseWord.examples && baseWord.examples.length > 0;
                const hasGrammaticalExamples =
                    baseWord.grammaticalExamples &&
                    baseWord.grammaticalExamples.length > 0;

                return hasExamples || hasGrammaticalExamples;
            }),
        [words],
    );

    // Инициализируем массив фраз для всех слов
    const [wordPhrases, setWordPhrases] = useState<Phrase[][]>([]);

    useEffect(() => {
        const phrases = createPhrases(wordsWithPhrases, sentencesPerWord);
        setWordPhrases(phrases);
    }, [wordsWithPhrases, sentencesPerWord]);

    // Рассчитываем общий прогресс
    const totalPhrases = wordPhrases.reduce(
        (total, phrases) => total + phrases.length,
        0,
    );

    return {
        wordsWithPhrases,
        wordPhrases,
        totalPhrases,
    };
}
