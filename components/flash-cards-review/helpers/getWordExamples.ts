import { Word } from '@/types/training.types';

export function getWordExamples(
    word: Word,
    ownLanguageCode: string,
): Array<{ example: string; translation: string }> {
    if (!word.baseWord?.examples || !ownLanguageCode) {
        return [];
    }

    const filteredExamples = word.baseWord.examples.filter(
        example => example.translationLanguage?.code === ownLanguageCode,
    );

    if (filteredExamples.length === 0) {
        return [];
    }

    // Pick up to 2 examples deterministically from word.id so the same word
    // always shows the same pair across renders.
    if (filteredExamples.length > 2) {
        const seed = word.id
            .toString()
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const shuffled = [...filteredExamples].sort((a, b) => {
            const indexA = filteredExamples.indexOf(a);
            const indexB = filteredExamples.indexOf(b);
            const hashA = (indexA + seed) * (a.example.charCodeAt(0) || 1);
            const hashB = (indexB + seed) * (b.example.charCodeAt(0) || 1);
            return (hashA % 1000) - (hashB % 1000);
        });
        return shuffled.slice(0, 2);
    }

    return filteredExamples;
}
