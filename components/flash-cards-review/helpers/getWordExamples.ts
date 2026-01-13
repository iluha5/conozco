import { Word } from '@/types/training.types';

/**
 * Получить до 2 случайных примеров предложений для слова
 * Если примеров больше 2, выбираются 2 случайных на основе word.id для стабильности
 */
export function getWordExamples(
    word: Word,
    ownLanguageCode: string,
): Array<{ example: string; translation: string }> {
    if (!word.baseWord?.examples || !ownLanguageCode) {
        return [];
    }

    // Filter examples by translation language
    const filteredExamples = word.baseWord.examples.filter(
        example => example.translationLanguage?.code === ownLanguageCode,
    );

    if (filteredExamples.length === 0) {
        return [];
    }

    // If more than 2 examples, select 2 random based on word.id for stability
    if (filteredExamples.length > 2) {
        // Use word.id as seed for stable selection
        const seed = word.id
            .toString()
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const shuffled = [...filteredExamples].sort((a, b) => {
            // Use index and example content to create hash
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
