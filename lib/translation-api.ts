import { translateWithDeepL } from './deepl-api';
import { translateWithMyMemory } from './mymemory-api';

interface TatoebaSearchParams {
    from: string;
    to: string;
    query: string;
}

interface TatoebaSentence {
    id: number;
    text: string;
    lang: string;
    translations?: Array<{
        id: number;
        text: string;
        lang: string;
    }>;
}

interface TatoebaSearchResponse {
    paging: {
        Sentences: {
            finder: string;
            page: number;
            current: number;
            count: number;
            perPage: number;
            start: number;
            end: number;
        };
    };
    results: TatoebaSentence[];
}

export interface TranslationResult {
    word: string;
    sourceLanguage: string;
    targetLanguage: string;
    mainTranslation: string;
    alternativeTranslations: string[];
    source?: 'DEEPL' | 'MYMEMORY';
    examples: Array<{
        sentence: string;
        translation: string;
        sentenceId?: number;
    }>;
}

const TATOEBA_API_URL = 'https://tatoeba.org/en/api_v0';
const TATOEBA_MAX_RETRIES = 3;
const TATOEBA_RETRY_DELAY = 2000;
export const TATOEBA_MAX_SENTENCE_WORDS = 10;

const LANGUAGE_CODE_MAP: { [key: string]: string } = {
    en: 'eng',
    es: 'spa',
    ru: 'rus',
};

async function getSourceId(sourceCode: string): Promise<number | null> {
    try {
        const { prisma } = await import('./prisma');
        if (!prisma) return null;

        const source = await prisma.wordSource.findUnique({
            where: { code: sourceCode },
            select: { id: true },
        });

        return source?.id || null;
    } catch (error) {
        console.error(`Failed to get sourceId for "${sourceCode}":`, error);
        return null;
    }
}

async function getLanguageId(languageCode: string): Promise<number | null> {
    try {
        const { prisma } = await import('./prisma');
        if (!prisma) return null;

        const language = await prisma.language.findUnique({
            where: { code: languageCode },
            select: { id: true },
        });

        return language?.id || null;
    } catch (error) {
        console.error(`Failed to get languageId for "${languageCode}":`, error);
        return null;
    }
}

async function logApiRequest(
    userId: number | null,
    sourceCode: string,
    requestType: string,
    requestData: any,
    responseData: any | null,
    statusCode: number | null,
    errorMessage: string | null | undefined,
    duration: number,
    sourceLanguageCode?: string,
    targetLanguageCode?: string,
) {
    try {
        const sourceId = await getSourceId(sourceCode);
        if (!sourceId) return;

        let sourceLanguageId: number | null | undefined;
        let targetLanguageId: number | null | undefined;

        if (sourceLanguageCode) {
            sourceLanguageId = await getLanguageId(sourceLanguageCode);
        }
        if (targetLanguageCode) {
            targetLanguageId = await getLanguageId(targetLanguageCode);
        }

        const { prisma } = await import('./prisma');
        if (!prisma) return;

        const safeStringify = (value: unknown): string => {
            try {
                return JSON.stringify(value);
            } catch {
                return JSON.stringify({ error: 'Failed to serialize' });
            }
        };

        await prisma.apiRequestLog.create({
            data: {
                userId,
                sourceId,
                sourceLanguageId,
                targetLanguageId,
                requestType,
                requestData: safeStringify(requestData),
                responseData: responseData ? safeStringify(responseData) : null,
                statusCode,
                errorMessage,
                duration,
            },
        });
    } catch (error) {
        console.error('Failed to log API request:', error, {
            userId,
            sourceCode,
            requestType,
            statusCode,
            errorMessage,
            duration,
        });
    }
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function hasLatinCharacters(text: string): boolean {
    return /[a-zA-Z]/.test(text);
}

export function removePunctuation(text: string): string {
    return text
        .replace(/[^а-яА-ЯёЁa-zA-Z0-9\s]/g, '')
        .toLowerCase()
        .trim();
}

// Drops translations containing Latin chars (we already get the source word in Latin) and dedupes.
// If everything gets filtered out we keep the first original to avoid an empty result.
export function filterTranslations(translations: string[]): string[] {
    if (translations.length === 0) return translations;

    const originalTranslations = [...translations];
    let filtered = translations.filter(
        translation => !hasLatinCharacters(translation),
    );

    const seen = new Set<string>();
    filtered = filtered.filter(translation => {
        const normalized = removePunctuation(translation);
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
    });

    return filtered.length === 0 ? [originalTranslations[0]] : filtered;
}

export function areSentencesDifferent(
    sentence: string,
    translation: string,
): boolean {
    return removePunctuation(sentence) !== removePunctuation(translation);
}

export function isSingleWord(text: string): boolean {
    const normalized = removePunctuation(text);
    return !normalized.includes(' ') && normalized.length > 0;
}

export function countWords(text: string): number {
    return removePunctuation(text).split(/\s+/).filter(Boolean).length;
}

export function isSentenceWithinWordLimit(
    text: string,
    maxWords: number = TATOEBA_MAX_SENTENCE_WORDS,
): boolean {
    return countWords(text) <= maxWords;
}

// Drops single-word "examples", any that just repeat the source word, and de-duplicates by sentence and translation.
export function filterDuplicateExamples<
    T extends { sentence: string; translation: string },
>(examples: T[], originalWord?: string): T[] {
    const seenSentences = new Set<string>();
    const seenTranslations = new Set<string>();
    const normalizedOriginal = originalWord
        ? removePunctuation(originalWord)
        : null;

    return examples.filter(example => {
        const normalizedSentence = removePunctuation(example.sentence);
        const normalizedTranslation = removePunctuation(example.translation);

        if (
            isSingleWord(example.sentence) ||
            isSingleWord(example.translation)
        ) {
            return false;
        }

        if (
            normalizedOriginal &&
            (normalizedSentence === normalizedOriginal ||
                normalizedTranslation === normalizedOriginal)
        ) {
            return false;
        }

        if (seenSentences.has(normalizedSentence)) return false;
        if (seenTranslations.has(normalizedTranslation)) return false;

        seenSentences.add(normalizedSentence);
        seenTranslations.add(normalizedTranslation);
        return true;
    });
}

// Tries DeepL first (3 retries handled inside translateWithDeepL); falls back to MyMemory if it gives up.
export async function translateWord(
    word: string,
    sourceLanguage: string,
    targetLanguage: string,
    userId: number | null = null,
): Promise<{
    mainTranslation: string;
    alternatives: string[];
    error?: string;
    source?: 'DEEPL' | 'MYMEMORY';
}> {
    const deeplResult = await translateWithDeepL(
        word,
        sourceLanguage,
        targetLanguage,
        userId,
        3,
    );

    if (deeplResult.mainTranslation && !deeplResult.error) {
        return { ...deeplResult, source: 'DEEPL' };
    }

    const myMemoryResult = await translateWithMyMemory(
        word,
        sourceLanguage,
        targetLanguage,
        userId,
    );

    if (myMemoryResult.mainTranslation && !myMemoryResult.error) {
        return { ...myMemoryResult, source: 'MYMEMORY' };
    }

    return {
        mainTranslation: '',
        alternatives: [],
        error: `DeepL: ${deeplResult.error}, MyMemory: ${myMemoryResult.error}`,
    };
}

export async function searchExamples(
    word: string,
    sourceLanguage: string,
    targetLanguage: string,
    userId: number | null = null,
    maxRetries: number = TATOEBA_MAX_RETRIES,
): Promise<
    Array<{
        sentence: string;
        translation: string;
        sentenceId: number;
    }>
> {
    const sourceLang = LANGUAGE_CODE_MAP[sourceLanguage] || sourceLanguage;
    const targetLang = LANGUAGE_CODE_MAP[targetLanguage] || targetLanguage;

    const requestData: TatoebaSearchParams = {
        from: sourceLang,
        to: targetLang,
        query: word,
    };

    let lastError: string | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const startTime = Date.now();

        try {
            const params = new URLSearchParams({
                from: sourceLang,
                to: targetLang,
                query: word,
            });

            const response = await fetch(
                `${TATOEBA_API_URL}/search?${params}`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            const duration = Date.now() - startTime;
            const data: TatoebaSearchResponse = await response.json();

            await logApiRequest(
                userId,
                'TATOEBA',
                'search_examples',
                { ...requestData, attempt },
                data,
                response.status,
                null,
                duration,
                sourceLanguage,
                targetLanguage,
            );

            if (!response.ok) {
                throw new Error(
                    `Tatoeba API error: ${response.status} ${response.statusText}`,
                );
            }

            const examples: Array<{
                sentence: string;
                translation: string;
                sentenceId: number;
            }> = [];

            // translations[1] holds direct (1-hop) translations; translations[0] is the indirect ones we don't want.
            for (const result of data.results) {
                if (
                    result.translations &&
                    Array.isArray(result.translations) &&
                    result.translations.length > 1 &&
                    Array.isArray(result.translations[1]) &&
                    result.translations[1].length > 0
                ) {
                    const translation = result.translations[1][0];
                    if (
                        translation?.text &&
                        areSentencesDifferent(result.text, translation.text) &&
                        isSentenceWithinWordLimit(result.text) &&
                        isSentenceWithinWordLimit(translation.text)
                    ) {
                        examples.push({
                            sentence: result.text,
                            translation: translation.text,
                            sentenceId: result.id,
                        });
                    }
                }

                if (examples.length >= 15) break;
            }

            const filteredExamples = filterDuplicateExamples(
                examples,
                word,
            ).slice(0, 10);

            if (filteredExamples.length > 0) return filteredExamples;

            if (attempt < maxRetries) {
                await delay(TATOEBA_RETRY_DELAY);
                continue;
            }

            return [];
        } catch (error: any) {
            const duration = Date.now() - startTime;
            lastError = error.message || 'Unknown error';

            await logApiRequest(
                userId,
                'TATOEBA',
                'search_examples',
                { ...requestData, attempt },
                null,
                null,
                lastError,
                duration,
                sourceLanguage,
                targetLanguage,
            );

            if (attempt < maxRetries) {
                await delay(TATOEBA_RETRY_DELAY);
                continue;
            }

            console.error(
                `Tatoeba: failed after ${maxRetries} attempts:`,
                lastError,
            );
            return [];
        }
    }

    return [];
}

// Quick path uses 1 retry to keep latency tight; if it returns 0 examples we kick off
// a more thorough background lookup (3 retries) that can populate the cache for next time.
export async function getWordData(
    word: string,
    sourceLanguage: string,
    targetLanguage: string,
    userId: number | null = null,
): Promise<TranslationResult | { error: string }> {
    try {
        const [translationResult, examples] = await Promise.all([
            translateWord(word, sourceLanguage, targetLanguage, userId),
            searchExamples(word, sourceLanguage, targetLanguage, userId, 1),
        ]);

        if (translationResult.error || !translationResult.mainTranslation) {
            return {
                error:
                    translationResult.error ||
                    'Failed to translate word. Please try again.',
            };
        }

        if (examples.length === 0) {
            searchExamples(
                word,
                sourceLanguage,
                targetLanguage,
                userId,
                3,
            ).catch(error => {
                console.error('Background search failed:', error);
            });
        }

        return {
            word,
            sourceLanguage,
            targetLanguage,
            mainTranslation: translationResult.mainTranslation,
            alternativeTranslations: translationResult.alternatives,
            source: translationResult.source,
            examples: examples.map(example => ({
                sentence: example.sentence,
                translation: example.translation,
                sentenceId: example.sentenceId,
            })),
        };
    } catch (error: any) {
        console.error('Error in getWordData:', error);
        return {
            error: error.message || 'An unexpected error occurred',
        };
    }
}
