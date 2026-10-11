import 'server-only';

import {
    searchExamples,
    translateWord,
    type TranslationResult,
} from '@/lib/translation-api';
import { normalizeLearnWord } from '@/lib/language-detect';
import {
    createBaseWordFromExternal,
    findBaseWordByExactMatch,
    findBaseWordByExactTranslation,
} from '@/lib/words/createBaseWordFromExternal';

type StoredBaseWord = Awaited<ReturnType<typeof createBaseWordFromExternal>>;

export type ExternalLookupSuccess = {
    baseWord: StoredBaseWord;
    foundExamples: number;
    resolvedWord: string;
    alreadyExists: boolean;
};

export type ExternalLookupFailure = {
    error: string;
};

type ExampleSentence = {
    sentence: string;
    translation: string;
    sentenceId: number;
};

type PersistLearnWordParams = {
    learnWord: string;
    learnLanguage: string;
    learnLanguageId: number;
    ownLanguage: string;
    mainTranslation: string;
    alternativeTranslations: string[];
    source?: 'DEEPL' | 'MYMEMORY';
    examples: ExampleSentence[];
};

async function loadExamples(
    learnWord: string,
    learnLanguage: string,
    ownLanguage: string,
    userId: number,
): Promise<ExampleSentence[]> {
    const examples = await searchExamples(
        learnWord,
        learnLanguage,
        ownLanguage,
        userId,
        1,
    );

    if (examples.length === 0) {
        searchExamples(learnWord, learnLanguage, ownLanguage, userId, 3).catch(
            error => {
                console.error('Background search failed:', error);
            },
        );
    }

    return examples;
}

async function persistLearnWord({
    learnWord,
    learnLanguage,
    learnLanguageId,
    ownLanguage,
    mainTranslation,
    alternativeTranslations,
    source,
    examples,
}: PersistLearnWordParams): Promise<ExternalLookupSuccess> {
    const wordData: TranslationResult = {
        word: learnWord,
        sourceLanguage: learnLanguage,
        targetLanguage: ownLanguage,
        mainTranslation,
        alternativeTranslations,
        source,
        examples: examples.map(example => ({
            sentence: example.sentence,
            translation: example.translation,
            sentenceId: example.sentenceId,
        })),
    };

    const baseWord = await createBaseWordFromExternal({
        trimmedWord: learnWord,
        languageId: learnLanguageId,
        translationLanguageCode: ownLanguage,
        wordData,
    });

    return {
        baseWord,
        foundExamples: examples.length,
        resolvedWord: learnWord,
        alreadyExists: false,
    };
}

type AddFromNativeInputParams = {
    nativeWord: string;
    learnLanguage: string;
    learnLanguageId: number;
    ownLanguage: string;
    userId: number;
};

export async function addFromNativeInput({
    nativeWord,
    learnLanguage,
    learnLanguageId,
    ownLanguage,
    userId,
}: AddFromNativeInputParams): Promise<
    ExternalLookupSuccess | ExternalLookupFailure
> {
    const existingByTranslation = await findBaseWordByExactTranslation(
        nativeWord,
        learnLanguageId,
        ownLanguage,
    );

    if (existingByTranslation) {
        return {
            baseWord: existingByTranslation,
            foundExamples: existingByTranslation.examples?.length ?? 0,
            resolvedWord: existingByTranslation.word,
            alreadyExists: true,
        };
    }

    const learnTranslation = await translateWord(
        nativeWord,
        ownLanguage,
        learnLanguage,
        userId,
    );

    if (learnTranslation.error || !learnTranslation.mainTranslation) {
        return {
            error:
                learnTranslation.error ||
                'Failed to translate word. Please try again.',
        };
    }

    const learnWord = normalizeLearnWord(learnTranslation.mainTranslation);
    if (!learnWord || learnWord === nativeWord) {
        return { error: 'Failed to translate word. Please try again.' };
    }

    const existingByWord = await findBaseWordByExactMatch(
        learnWord,
        learnLanguageId,
        ownLanguage,
    );

    if (existingByWord) {
        return {
            baseWord: existingByWord,
            foundExamples: existingByWord.examples?.length ?? 0,
            resolvedWord: existingByWord.word,
            alreadyExists: true,
        };
    }

    const [nativeTranslation, examples] = await Promise.all([
        translateWord(learnWord, learnLanguage, ownLanguage, userId),
        loadExamples(learnWord, learnLanguage, ownLanguage, userId),
    ]);

    const saved = await persistLearnWord({
        learnWord,
        learnLanguage,
        learnLanguageId,
        ownLanguage,
        mainTranslation: nativeTranslation.mainTranslation || nativeWord,
        alternativeTranslations: nativeTranslation.mainTranslation
            ? nativeTranslation.alternatives
            : [],
        source: learnTranslation.source,
        examples,
    });

    return saved;
}

type AddLearnWordFromKnownTranslationParams = {
    learnWord: string;
    learnLanguage: string;
    learnLanguageId: number;
    ownLanguage: string;
    userId: number;
    mainTranslation: string;
    alternativeTranslations: string[];
    source?: 'DEEPL' | 'MYMEMORY';
};

export async function addLearnWordFromKnownTranslation({
    learnWord,
    learnLanguage,
    learnLanguageId,
    ownLanguage,
    userId,
    mainTranslation,
    alternativeTranslations,
    source,
}: AddLearnWordFromKnownTranslationParams): Promise<ExternalLookupSuccess> {
    const examples = await loadExamples(
        learnWord,
        learnLanguage,
        ownLanguage,
        userId,
    );

    return persistLearnWord({
        learnWord,
        learnLanguage,
        learnLanguageId,
        ownLanguage,
        mainTranslation,
        alternativeTranslations,
        source,
        examples,
    });
}
