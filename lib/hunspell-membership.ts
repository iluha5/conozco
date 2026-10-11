import nspell from 'nspell';
import englishDictionary from 'dictionary-en';
import spanishDictionary from 'dictionary-es';
import type { DictionaryMembership } from '@/lib/language-detect';

type SpellChecker = {
    correct: (_word: string) => boolean;
};

let englishSpell: SpellChecker | null = null;
let spanishSpell: SpellChecker | null = null;

function getSpellCheckers(): {
    englishSpell: SpellChecker;
    spanishSpell: SpellChecker;
} {
    if (!englishSpell) {
        englishSpell = nspell(englishDictionary);
    }
    if (!spanishSpell) {
        spanishSpell = nspell(spanishDictionary);
    }

    return { englishSpell, spanishSpell };
}

export function dictionaryMembership(word: string): DictionaryMembership {
    const spellCheckers = getSpellCheckers();
    const inEnglish = spellCheckers.englishSpell.correct(word);
    const inSpanish = spellCheckers.spanishSpell.correct(word);

    if (inEnglish && inSpanish) return 'both';
    if (inEnglish) return 'en';
    if (inSpanish) return 'es';
    return 'neither';
}
