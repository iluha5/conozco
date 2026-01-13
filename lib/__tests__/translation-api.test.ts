import {
    hasLatinCharacters,
    removePunctuation,
    filterTranslations,
    areSentencesDifferent,
    filterDuplicateExamples,
    isSingleWord,
} from '../translation-api';

describe('Translation API Utilities', () => {
    describe('hasLatinCharacters', () => {
        it('should detect Latin characters', () => {
            expect(hasLatinCharacters('Hello')).toBe(true);
            expect(hasLatinCharacters('cat')).toBe(true);
            expect(hasLatinCharacters('Test123')).toBe(true);
        });

        it('should return false for non-Latin text', () => {
            expect(hasLatinCharacters('Привет')).toBe(false);
            expect(hasLatinCharacters('кот')).toBe(false);
            expect(hasLatinCharacters('123')).toBe(false);
            expect(hasLatinCharacters('¿?')).toBe(false);
            expect(hasLatinCharacters('¡!')).toBe(false);
        });

        it('should detect mixed text', () => {
            expect(hasLatinCharacters('кот cat')).toBe(true);
            expect(hasLatinCharacters('cat (animal)')).toBe(true);
            expect(hasLatinCharacters('¿Hola?')).toBe(true);
        });
    });

    describe('removePunctuation', () => {
        it('should remove punctuation', () => {
            expect(removePunctuation('Hello!')).toBe('hello');
            expect(removePunctuation('¿Hola?')).toBe('hola');
            expect(removePunctuation('Привет!!!')).toBe('привет');
        });

        it('should convert to lowercase', () => {
            expect(removePunctuation('HELLO')).toBe('hello');
            expect(removePunctuation('ПРИВЕТ')).toBe('привет');
        });

        it('should handle mixed punctuation', () => {
            expect(removePunctuation('¡Por favor!')).toBe('por favor');
            expect(removePunctuation('Por favor...')).toBe('por favor');
            expect(removePunctuation('Пожалуйста!')).toBe('пожалуйста');
            expect(removePunctuation('Пожалуйста...')).toBe('пожалуйста');
        });

        it('should trim whitespace', () => {
            expect(removePunctuation('  hello  ')).toBe('hello');
            expect(removePunctuation('  привет  ')).toBe('привет');
        });
    });

    describe('filterTranslations', () => {
        it('should remove translations with Latin characters', () => {
            const input = ['кот', 'cat (animal)', 'домашнее животное'];
            const result = filterTranslations(input);
            expect(result).toEqual(['кот', 'домашнее животное']);
        });

        it('should remove duplicate translations', () => {
            const input = ['кот', 'кот!', 'кот.', 'собака'];
            const result = filterTranslations(input);
            expect(result).toEqual(['кот', 'собака']);
        });

        it('should return first original if all filtered', () => {
            const input = ['cat', 'dog', 'animal'];
            const result = filterTranslations(input);
            expect(result).toEqual(['cat']);
        });

        it('should handle empty array', () => {
            const result = filterTranslations([]);
            expect(result).toEqual([]);
        });

        it('should handle single translation', () => {
            const result = filterTranslations(['кот']);
            expect(result).toEqual(['кот']);
        });
    });

    describe('areSentencesDifferent', () => {
        it('should detect same sentences with different punctuation', () => {
            expect(areSentencesDifferent('¿Hola?', 'Hola')).toBe(false);
            expect(areSentencesDifferent('Hello!!!', 'Hello.')).toBe(false);
            expect(areSentencesDifferent('ПРИВЕТ', 'привет')).toBe(false);
        });

        it('should detect different sentences', () => {
            expect(areSentencesDifferent('¿Cómo estás?', 'Как дела?')).toBe(
                true,
            );
            expect(
                areSentencesDifferent('¡Hola, amigo!', 'Привет, друг!'),
            ).toBe(true);
        });

        it('should detect empty strings as same', () => {
            expect(areSentencesDifferent('', '')).toBe(false);
        });
    });

    describe('isSingleWord', () => {
        it('should detect single words', () => {
            expect(isSingleWord('Hola')).toBe(true);
            expect(isSingleWord('Привет')).toBe(true);
            expect(isSingleWord('¡Hola!')).toBe(true);
        });

        it('should detect multiple words', () => {
            expect(isSingleWord('Hola amigo')).toBe(false);
            expect(isSingleWord('Por favor')).toBe(false);
            expect(isSingleWord('Как дела')).toBe(false);
        });

        it('should handle empty string', () => {
            expect(isSingleWord('')).toBe(false);
        });
    });

    describe('filterDuplicateExamples', () => {
        it('should filter duplicate examples (por favor case)', () => {
            const examples = [
                {
                    sentence: '¡Por favor, ayúdame!',
                    translation: 'Пожалуйста, помоги мне!',
                    sentenceId: 1,
                },
                {
                    sentence: 'Por favor, ayúdame...',
                    translation: 'Пожалуйста, помоги мне...',
                    sentenceId: 2,
                },
                {
                    sentence: '¿Por favor, ayúdame?',
                    translation: 'Пожалуйста, помоги мне?',
                    sentenceId: 3,
                },
            ];

            const result = filterDuplicateExamples(examples);

            // Should keep only one example
            expect(result).toHaveLength(1);
            expect(result[0].sentenceId).toBe(1);
        });

        it('should filter duplicate translations (new requirement)', () => {
            const examples = [
                {
                    sentence: 'Pésemelo, por favor.',
                    translation: 'Взвесьте мне его, пожалуйста.',
                    sentenceId: 1,
                },
                {
                    sentence: '¿Me lo pesa, por favor?',
                    translation: 'Взвесьте мне его, пожалуйста.',
                    sentenceId: 2,
                },
            ];

            const result = filterDuplicateExamples(examples);

            // Should keep only one, as translations are identical
            expect(result).toHaveLength(1);
            expect(result[0].sentenceId).toBe(1);
        });

        it('should filter duplicate sentences', () => {
            const examples = [
                {
                    sentence: 'Hola amigo',
                    translation: 'Привет друг',
                    sentenceId: 1,
                },
                {
                    sentence: '¡Hola amigo!',
                    translation: 'Здравствуй друг',
                    sentenceId: 2,
                },
            ];

            const result = filterDuplicateExamples(examples);

            // Should keep only one, as sentences are identical after normalization
            expect(result).toHaveLength(1);
            expect(result[0].sentenceId).toBe(1);
        });

        it('should keep different examples', () => {
            const examples = [
                {
                    sentence: 'Hola amigo',
                    translation: 'Привет друг',
                    sentenceId: 1,
                },
                {
                    sentence: 'Adiós amigo',
                    translation: 'Пока друг',
                    sentenceId: 2,
                },
                {
                    sentence: 'Gracias amigo',
                    translation: 'Спасибо друг',
                    sentenceId: 3,
                },
            ];

            const result = filterDuplicateExamples(examples);
            expect(result).toHaveLength(3);
        });

        it('should handle empty array', () => {
            const result = filterDuplicateExamples([]);
            expect(result).toEqual([]);
        });

        it('should filter single-word examples', () => {
            const examples = [
                {
                    sentence: 'Hola',
                    translation: 'Привет',
                    sentenceId: 1,
                },
                {
                    sentence: 'Hola amigo',
                    translation: 'Привет друг',
                    sentenceId: 2,
                },
                {
                    sentence: 'Buenos días',
                    translation: 'Спасибо большое',
                    sentenceId: 3,
                },
            ];

            const result = filterDuplicateExamples(examples);

            // Should keep only 2 examples (without single words)
            expect(result).toHaveLength(2);
            expect(result[0].sentenceId).toBe(2);
            expect(result[1].sentenceId).toBe(3);
        });

        it('should filter examples matching original word', () => {
            const examples = [
                {
                    sentence: 'Por favor',
                    translation: 'Пожалуйста',
                    sentenceId: 1,
                },
                {
                    sentence: '¡Por favor!',
                    translation: 'Пожалуйста!',
                    sentenceId: 2,
                },
                {
                    sentence: 'Por favor, ayúdame',
                    translation: 'Пожалуйста, помоги мне',
                    sentenceId: 3,
                },
            ];

            const result = filterDuplicateExamples(examples, 'por favor');

            // Should keep only the third example
            expect(result).toHaveLength(1);
            expect(result[0].sentenceId).toBe(3);
        });

        it('should filter examples when translation matches original word', () => {
            const examples = [
                {
                    sentence: 'Me gusta el gato negro',
                    translation: 'Мне нравится черный кот',
                    sentenceId: 1,
                },
                {
                    sentence: 'El gato es negro',
                    translation: 'Черный кот',
                    sentenceId: 2,
                },
                {
                    sentence: 'Mi gato duerme mucho',
                    translation: 'Мой кот много спит',
                    sentenceId: 3,
                },
            ];

            const result = filterDuplicateExamples(examples, 'черный кот');

            // Should keep only examples 1 and 3 (2 is filtered as matching original)
            expect(result).toHaveLength(2);
            expect(result[0].sentenceId).toBe(1);
            expect(result[1].sentenceId).toBe(3);
        });
    });
});
