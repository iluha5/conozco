import {
    EXTENSION_MAX_WORD_LENGTH,
    validateExtensionWordInput,
} from '@/lib/extension/word-input';

describe('validateExtensionWordInput', () => {
    it('accepts a valid single word', () => {
        const result = validateExtensionWordInput('  Hello  ');

        expect(result).toEqual({
            valid: true,
            normalizedWord: 'hello',
        });
    });

    it('accepts a valid phrase', () => {
        const result = validateExtensionWordInput('take on');

        expect(result).toEqual({
            valid: true,
            normalizedWord: 'take on',
        });
    });

    it('rejects empty input', () => {
        const result = validateExtensionWordInput('   ');

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Word cannot be empty');
    });

    it('rejects multiline input', () => {
        const result = validateExtensionWordInput('hello\nworld');

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Word or phrase must be on a single line');
    });

    it('rejects input longer than max length', () => {
        const longWord = 'a'.repeat(EXTENSION_MAX_WORD_LENGTH + 1);
        const result = validateExtensionWordInput(longWord);

        expect(result.valid).toBe(false);
        expect(result.error).toBe(
            `Word or phrase must be at most ${EXTENSION_MAX_WORD_LENGTH} characters`,
        );
    });
});
