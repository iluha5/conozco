import type { Word } from '../typing';

export function getTranslationDialogWord(
    listWord: Word,
    fetchedWord: Word | null,
): Word | null {
    if (!fetchedWord || fetchedWord.id !== listWord.id) {
        return null;
    }

    return fetchedWord;
}
