import { translateWithDeepL } from './deepl-api';
import { translateWithMyMemory } from './mymemory-api';

// Types for Tatoeba
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

// Types for results
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

// API configuration
const TATOEBA_API_URL = 'https://tatoeba.org/en/api_v0';
const TATOEBA_MAX_RETRIES = 3;
const TATOEBA_RETRY_DELAY = 2000; // 2 seconds

// Language code mapping for Tatoeba
const LANGUAGE_CODE_MAP: { [key: string]: string } = {
    en: 'eng',
    es: 'spa',
    ru: 'rus',
};

// Utility to get source ID by code
async function getSourceId(sourceCode: string): Promise<number | null> {
    try {
        const { prisma } = await import('./prisma');

        if (!prisma) {
            console.error('[LOG] Prisma client is undefined!');
            return null;
        }

        const source = await prisma.wordSource.findUnique({
            where: { code: sourceCode },
            select: { id: true },
        });

        return source?.id || null;
    } catch (error) {
        console.error(
            `[LOG] Failed to get sourceId for "${sourceCode}":`,
            error,
        );
        return null;
    }
}

// Utility to get language ID by code
async function getLanguageId(languageCode: string): Promise<number | null> {
    try {
        const { prisma } = await import('./prisma');

        if (!prisma) {
            console.error('[LOG] Prisma client is undefined!');
            return null;
        }

        const language = await prisma.language.findUnique({
            where: { code: languageCode },
            select: { id: true },
        });

        return language?.id || null;
    } catch (error) {
        console.error(
            `[LOG] Failed to get languageId for "${languageCode}":`,
            error,
        );
        return null;
    }
}

// Utility for logging API requests
async function logApiRequest(
    userId: number | null,
    sourceCode: string, // 'DEEPL', 'MYMEMORY', 'TATOEBA'
    requestType: string,
    requestData: any,
    responseData: any | null,
    statusCode: number | null,
    errorMessage: string | null | undefined,
    duration: number,
    sourceLanguageCode?: string, // Source language code (e.g.: 'es', 'en')
    targetLanguageCode?: string, // Target language code (e.g.: 'ru')
) {
    try {
        console.log(
            `[LOG] Attempting to log API request: ${sourceCode}/${requestType}`,
        );

        // Get sourceId
        const sourceId = await getSourceId(sourceCode);

        if (!sourceId) {
            console.error(`[LOG] Failed to get sourceId for "${sourceCode}"`);
            return;
        }

        // Get language IDs if specified
        let sourceLanguageId: number | null | undefined = undefined;
        let targetLanguageId: number | null | undefined = undefined;

        if (sourceLanguageCode) {
            sourceLanguageId = await getLanguageId(sourceLanguageCode);
        }

        if (targetLanguageCode) {
            targetLanguageId = await getLanguageId(targetLanguageCode);
        }

        // Import prisma inside function to guarantee server context
        const { prisma } = await import('./prisma');

        if (!prisma) {
            console.error('[LOG] Prisma client is undefined!');
            return;
        }

        // Safe data serialization
        let requestDataStr: string;
        let responseDataStr: string | null = null;

        try {
            requestDataStr = JSON.stringify(requestData);
        } catch (e) {
            console.error('[LOG] Failed to stringify requestData:', e);
            requestDataStr = JSON.stringify({ error: 'Failed to serialize' });
        }

        if (responseData) {
            try {
                responseDataStr = JSON.stringify(responseData);
            } catch (e) {
                console.error('[LOG] Failed to stringify responseData:', e);
                responseDataStr = JSON.stringify({
                    error: 'Failed to serialize',
                });
            }
        }

        const logEntry = await prisma.apiRequestLog.create({
            data: {
                userId,
                sourceId,
                sourceLanguageId,
                targetLanguageId,
                requestType,
                requestData: requestDataStr,
                responseData: responseDataStr,
                statusCode,
                errorMessage,
                duration,
            },
        });

        console.log(
            `[LOG] Successfully logged API request with ID: ${logEntry.id}`,
        );
    } catch (error) {
        console.error('[LOG] Failed to log API request:', error);
        console.error('[LOG] Request data:', {
            userId,
            sourceCode,
            requestType,
            statusCode,
            errorMessage,
            duration,
        });
    }
}

// Delay utility
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Проверяет, содержит ли строка латинские символы
 */
export function hasLatinCharacters(text: string): boolean {
    // Check for Latin letters presence (a-z, A-Z)
    return /[a-zA-Z]/.test(text);
}

/**
 * Удаляет все знаки препинания из строки для сравнения
 */
export function removePunctuation(text: string): string {
    // Remove all characters except letters (Cyrillic, Latin), digits and spaces
    return text
        .replace(/[^а-яА-ЯёЁa-zA-Z0-9\s]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Фильтрует переводы по критериям качества
 */
export function filterTranslations(translations: string[]): string[] {
    if (translations.length === 0) {
        return translations;
    }

    // Save original translations in case all are filtered out
    const originalTranslations = [...translations];

    // 1. Filter translations with Latin characters
    let filtered = translations.filter(t => !hasLatinCharacters(t));

    // 2. Remove duplicates (compare without punctuation)
    const seen = new Set<string>();
    filtered = filtered.filter(translation => {
        const normalized = removePunctuation(translation);
        if (seen.has(normalized)) {
            return false;
        }
        seen.add(normalized);
        return true;
    });

    // 3. If no translations left after filtering - return first original
    if (filtered.length === 0) {
        return [originalTranslations[0]];
    }

    return filtered;
}

/**
 * Проверяет, что предложение и перевод различаются
 * (после нормализации - удаления знаков препинания и приведения к нижнему регистру)
 */
export function areSentencesDifferent(
    sentence: string,
    translation: string,
): boolean {
    const normalizedSentence = removePunctuation(sentence);
    const normalizedTranslation = removePunctuation(translation);

    return normalizedSentence !== normalizedTranslation;
}

/**
 * Проверяет, состоит ли текст только из одного слова
 */
export function isSingleWord(text: string): boolean {
    const normalized = removePunctuation(text);
    return !normalized.includes(' ') && normalized.length > 0;
}

/**
 * Фильтрует дубликаты из массива примеров предложений
 * Проверяет как предложения, так и переводы на дубликаты после нормализации
 * Также фильтрует примеры из одного слова и совпадающие с исходным словом
 */
export function filterDuplicateExamples<
    T extends { sentence: string; translation: string },
>(examples: T[], originalWord?: string): T[] {
    const seenSentences = new Set<string>();
    const seenTranslations = new Set<string>();

    // Normalize source word/phrase for checking
    const normalizedOriginal = originalWord
        ? removePunctuation(originalWord)
        : null;

    return examples.filter(example => {
        const normalizedSentence = removePunctuation(example.sentence);
        const normalizedTranslation = removePunctuation(example.translation);

        // Filter single-word examples
        if (
            isSingleWord(example.sentence) ||
            isSingleWord(example.translation)
        ) {
            return false;
        }

        // Filter examples matching source word/phrase
        if (normalizedOriginal) {
            if (
                normalizedSentence === normalizedOriginal ||
                normalizedTranslation === normalizedOriginal
            ) {
                return false;
            }
        }

        // Check sentence duplicates
        if (seenSentences.has(normalizedSentence)) {
            return false;
        }

        // Check translation duplicates
        if (seenTranslations.has(normalizedTranslation)) {
            return false;
        }

        seenSentences.add(normalizedSentence);
        seenTranslations.add(normalizedTranslation);
        return true;
    });
}

/**
 * Переводит слово через DeepL API с fallback на MyMemory
 * Сначала пытается получить перевод от DeepL (3 попытки)
 * Если DeepL не удалось - использует MyMemory как fallback
 */
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
    console.log(`[Translation] Starting translation for "${word}"`);

    // Try DeepL (with 3 attempts)
    const deeplResult = await translateWithDeepL(
        word,
        sourceLanguage,
        targetLanguage,
        userId,
        3, // MAX_RETRIES
    );

    // If DeepL successfully returned translation
    if (deeplResult.mainTranslation && !deeplResult.error) {
        console.log(`[Translation] DeepL translation successful`);
        return {
            ...deeplResult,
            source: 'DEEPL',
        };
    }

    // If DeepL failed - use MyMemory as fallback
    console.log(
        `[Translation] DeepL failed: ${deeplResult.error}. Falling back to MyMemory...`,
    );

    const myMemoryResult = await translateWithMyMemory(
        word,
        sourceLanguage,
        targetLanguage,
        userId,
    );

    if (myMemoryResult.mainTranslation && !myMemoryResult.error) {
        console.log(`[Translation] MyMemory fallback successful`);
        return {
            ...myMemoryResult,
            source: 'MYMEMORY',
        };
    }

    // If both services failed
    console.error(`[Translation] Both DeepL and MyMemory failed for "${word}"`);
    return {
        mainTranslation: '',
        alternatives: [],
        error: `DeepL: ${deeplResult.error}, MyMemory: ${myMemoryResult.error}`,
    };
}

/**
 * Ищет примеры предложений в Tatoeba с повторными попытками
 */
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

            // Process results
            const examples: Array<{
                sentence: string;
                translation: string;
                sentenceId: number;
            }> = [];

            for (const result of data.results) {
                // Tatoeba API returns translations as array of arrays
                // translations[0] - indirect translations
                // translations[1] - direct translations (which we need)
                if (
                    result.translations &&
                    Array.isArray(result.translations) &&
                    result.translations.length > 1 &&
                    Array.isArray(result.translations[1]) &&
                    result.translations[1].length > 0
                ) {
                    const translation = result.translations[1][0];
                    // Check that translation contains text
                    if (translation && translation.text) {
                        // Check that sentence and translation differ
                        if (
                            areSentencesDifferent(result.text, translation.text)
                        ) {
                            examples.push({
                                sentence: result.text,
                                translation: translation.text,
                                sentenceId: result.id,
                            });
                        }
                    }
                }

                // Limit to 15 examples (accounting for possible duplicates)
                if (examples.length >= 15) {
                    break;
                }
            }

            // Filter duplicates and limit to 10 examples
            const filteredExamples = filterDuplicateExamples(
                examples,
                word,
            ).slice(0, 10);

            // If found examples - return
            if (filteredExamples.length > 0) {
                return filteredExamples;
            }

            // If not last attempt and no examples - try again
            if (attempt < maxRetries) {
                console.log(
                    `Tatoeba: No examples found for "${word}", retrying (${attempt}/${maxRetries})...`,
                );
                await delay(TATOEBA_RETRY_DELAY);
                continue;
            }

            // If last attempt and no examples - return empty array
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

            // If not last attempt - try again
            if (attempt < maxRetries) {
                console.log(
                    `Tatoeba error (attempt ${attempt}/${maxRetries}):`,
                    lastError,
                );
                await delay(TATOEBA_RETRY_DELAY);
                continue;
            }

            // If last attempt - return empty array
            console.error(
                `Tatoeba: Failed after ${maxRetries} attempts:`,
                lastError,
            );
            return [];
        }
    }

    return [];
}

/**
 * Получает полные данные о слове: перевод + примеры
 * Поиск примеров продолжается в фоне даже если первый запрос не вернул результатов
 */
export async function getWordData(
    word: string,
    sourceLanguage: string,
    targetLanguage: string,
    userId: number | null = null,
): Promise<TranslationResult | { error: string }> {
    try {
        // Request translation and examples in parallel
        const [translationResult, examples] = await Promise.all([
            translateWord(word, sourceLanguage, targetLanguage, userId),
            searchExamples(word, sourceLanguage, targetLanguage, userId, 1), // First attempt
        ]);

        // If translation failed to get - return error
        if (translationResult.error || !translationResult.mainTranslation) {
            return {
                error:
                    translationResult.error ||
                    'Failed to translate word. Please try again.',
            };
        }

        // If examples not found - start background search
        if (examples.length === 0) {
            // Start background search (without await)
            searchExamples(word, sourceLanguage, targetLanguage, userId, 3)
                .then(backgroundExamples => {
                    if (backgroundExamples.length > 0) {
                        console.log(
                            `Found ${backgroundExamples.length} examples in background for "${word}"`,
                        );
                        // In real app here can update DB data or notify user
                    }
                })
                .catch(error => {
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
            examples: examples.map(ex => ({
                sentence: ex.sentence,
                translation: ex.translation,
                sentenceId: ex.sentenceId,
            })),
        };
    } catch (error: any) {
        console.error('Error in getWordData:', error);
        return {
            error: error.message || 'An unexpected error occurred',
        };
    }
}
