/**
 * Генерирует случайные буквы алфавита, исключая указанные буквы
 */
export function getRandomLetters(
    count: number,
    excludeLetters: string[],
): string[] {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const availableLetters = alphabet
        .split('')
        .filter(letter => !excludeLetters.includes(letter));
    const shuffled = [...availableLetters].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
