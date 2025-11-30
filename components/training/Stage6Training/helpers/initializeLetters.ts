import type { LetterState } from '../typing';

export function initializeLetters(word: string): LetterState[] {
    const wordLetters = word.split('');
    const shuffled = [...wordLetters].sort(() => Math.random() - 0.5);

    // Add 3 random letters
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const randomLetters = [];
    for (let letterIndex = 0; letterIndex < 3; letterIndex++) {
        const randomLetter =
            alphabet[Math.floor(Math.random() * alphabet.length)];
        randomLetters.push(randomLetter);
    }

    const allLetters = [...shuffled, ...randomLetters];
    const finalShuffled = allLetters.sort(() => Math.random() - 0.5);

    const letterStates: LetterState[] = finalShuffled.map(letter => ({
        letter,
        selected: false,
    }));

    return letterStates;
}
