import {
    decideInputLanguage,
    directionAfterDeepLDetect,
    normalizeLearnWord,
    type DictionaryMembership,
} from '../language-detect';

function membershipFrom(
    words: Record<string, DictionaryMembership>,
): (_token: string) => DictionaryMembership {
    return token => words[token] ?? 'neither';
}

describe('decideInputLanguage', () => {
    const englishAndSpanish = membershipFrom({
        hello: 'en',
        casa: 'es',
        café: 'es',
        no: 'both',
        buenos: 'es',
        días: 'es',
        good: 'en',
        morning: 'en',
        house: 'en',
    });

    it('treats Cyrillic as the native language when that language is Russian', () => {
        expect(
            decideInputLanguage({
                text: 'привет',
                learnLanguage: 'en',
                ownLanguage: 'ru',
                membership: englishAndSpanish,
            }).kind,
        ).toBe('reverse');
    });

    it('rejects Cyrillic when Russian is not in the pair', () => {
        expect(
            decideInputLanguage({
                text: 'привет',
                learnLanguage: 'en',
                ownLanguage: 'es',
                membership: englishAndSpanish,
            }),
        ).toEqual({ kind: 'reject', reason: 'outside-pair' });
    });

    it('rejects mixed scripts', () => {
        expect(
            decideInputLanguage({
                text: 'hello привет',
                learnLanguage: 'en',
                ownLanguage: 'ru',
                membership: englishAndSpanish,
            }),
        ).toEqual({ kind: 'reject', reason: 'mixed-script' });
    });

    it('keeps the forward path for digits and a missing native language', () => {
        expect(
            decideInputLanguage({
                text: '123',
                learnLanguage: 'en',
                ownLanguage: 'ru',
                membership: englishAndSpanish,
            }).kind,
        ).toBe('forward');
        expect(
            decideInputLanguage({
                text: 'hello',
                learnLanguage: 'en',
                ownLanguage: null,
                membership: englishAndSpanish,
            }).kind,
        ).toBe('forward');
    });

    it('uses Spanish marks before the dictionary', () => {
        expect(
            decideInputLanguage({
                text: 'niño',
                learnLanguage: 'en',
                ownLanguage: 'es',
                membership: () => 'neither',
            }).kind,
        ).toBe('reverse');
    });

    it('does not treat café as Spanish from accents alone', () => {
        expect(
            decideInputLanguage({
                text: 'café',
                learnLanguage: 'en',
                ownLanguage: 'es',
                membership: englishAndSpanish,
            }).kind,
        ).toBe('reverse');
        expect(
            decideInputLanguage({
                text: 'café',
                learnLanguage: 'en',
                ownLanguage: 'es',
                membership: () => 'both',
            }).kind,
        ).toBe('forward');
    });

    it('uses an exclusive dictionary hit', () => {
        expect(
            decideInputLanguage({
                text: 'hello',
                learnLanguage: 'en',
                ownLanguage: 'es',
                membership: englishAndSpanish,
            }).kind,
        ).toBe('forward');
        expect(
            decideInputLanguage({
                text: 'casa',
                learnLanguage: 'en',
                ownLanguage: 'es',
                membership: englishAndSpanish,
            }).kind,
        ).toBe('reverse');
    });

    it('treats a word found in both dictionaries as the learn language', () => {
        expect(
            decideInputLanguage({
                text: 'no',
                learnLanguage: 'en',
                ownLanguage: 'es',
                membership: englishAndSpanish,
            }).kind,
        ).toBe('forward');
    });

    it('asks DeepL only when the word is in neither dictionary', () => {
        expect(
            decideInputLanguage({
                text: 'xyzzy',
                learnLanguage: 'en',
                ownLanguage: 'es',
                membership: englishAndSpanish,
            }).kind,
        ).toBe('unknown');
    });

    it('votes across words in a phrase and treats a tie as forward', () => {
        expect(
            decideInputLanguage({
                text: 'buenos días',
                learnLanguage: 'en',
                ownLanguage: 'es',
                membership: englishAndSpanish,
            }).kind,
        ).toBe('reverse');
        expect(
            decideInputLanguage({
                text: 'casa house',
                learnLanguage: 'en',
                ownLanguage: 'es',
                membership: englishAndSpanish,
            }).kind,
        ).toBe('forward');
    });

    it('treats Latin input as the learn language when the native language is Russian', () => {
        expect(
            decideInputLanguage({
                text: 'hello',
                learnLanguage: 'en',
                ownLanguage: 'ru',
                membership: englishAndSpanish,
            }).kind,
        ).toBe('forward');
    });
});

describe('directionAfterDeepLDetect', () => {
    it('reverses when DeepL detects the native language or the same source and target', () => {
        expect(
            directionAfterDeepLDetect({
                detectedLanguage: 'es',
                sourceEqualsTarget: false,
                learnLanguage: 'en',
                ownLanguage: 'es',
            }),
        ).toBe('reverse');
        expect(
            directionAfterDeepLDetect({
                detectedLanguage: null,
                sourceEqualsTarget: true,
                learnLanguage: 'en',
                ownLanguage: 'es',
            }),
        ).toBe('reverse');
    });

    it('stays forward when DeepL is unsure', () => {
        expect(
            directionAfterDeepLDetect({
                detectedLanguage: 'fr',
                sourceEqualsTarget: false,
                learnLanguage: 'en',
                ownLanguage: 'es',
            }),
        ).toBe('forward');
    });
});

describe('normalizeLearnWord', () => {
    it('lowercases, drops trailing punctuation, and keeps the first option', () => {
        expect(normalizeLearnWord('Hello')).toBe('hello');
        expect(normalizeLearnWord('Hello, Hi')).toBe('hello');
        expect(normalizeLearnWord('good morning.')).toBe('good morning');
    });

    it('keeps at most five words', () => {
        expect(normalizeLearnWord('one two three four five six')).toBe(
            'one two three four five',
        );
    });

    it('returns an empty string when nothing remains', () => {
        expect(normalizeLearnWord('   ')).toBe('');
    });
});
