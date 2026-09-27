import type { Word } from '../typing';
import { getTranslationDialogWord } from './getTranslationDialogWord';

function buildWord(
    id: number,
    translations: string[],
    translationsCount?: number,
): Word {
    return {
        id,
        userId: 1,
        languageId: 1,
        language: { id: 1, code: 'en', name: 'English' },
        status: 'NOT_LEARNED',
        createdAt: '',
        updatedAt: '',
        baseWord: {
            id: 2,
            word: 'relish',
            languageId: 1,
            translations: translations.map((translation, index) => ({
                translation,
                priority: index + 1,
            })),
            translationsCount,
        },
        customTranslations: [],
    };
}

describe('getTranslationDialogWord', () => {
    it('gives the dialog the fetched translations when the list item is truncated', () => {
        const listWord = buildWord(92, ['наслаждаться'], 3);
        const fetchedWord = buildWord(92, [
            'наслаждаться',
            'упиваться',
            'получать удовольствие',
        ]);

        const dialogWord = getTranslationDialogWord(listWord, fetchedWord);

        expect(
            dialogWord?.baseWord?.translations.map(item => item.translation),
        ).toEqual(['наслаждаться', 'упиваться', 'получать удовольствие']);
    });

    it('returns null until the matching full word is fetched', () => {
        const listWord = buildWord(92, ['наслаждаться'], 3);

        expect(getTranslationDialogWord(listWord, null)).toBeNull();
    });
});
