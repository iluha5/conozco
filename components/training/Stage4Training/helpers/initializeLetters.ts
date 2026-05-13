import { getRandomLetters } from './getRandomLetters';
import type { LetterState } from '../typing';
import type { Word } from '@/types/training.types';
import { getWordText } from '@/lib/training-utils';
import type { Stage4Settings } from '@/lib/training-settings';

export function initializeLetters(
    word: Word,
    difficulty: Stage4Settings['difficulty'],
): LetterState[] {
    const wordText = getWordText(word);
    const wordLetters = wordText.split('');

    let extraLetters: string[] = [];
    if (difficulty === 'medium') {
        extraLetters = getRandomLetters(3, wordLetters);
    } else if (difficulty === 'hard') {
        extraLetters = getRandomLetters(6, wordLetters);
    }

    const allLetters = [...wordLetters, ...extraLetters];
    const shuffled = allLetters.sort(() => Math.random() - 0.5);
    const letterStates: LetterState[] = shuffled.map(letter => ({
        letter,
        selected: false,
    }));

    return letterStates;
}
