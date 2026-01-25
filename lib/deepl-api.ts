import { filterTranslations } from './translation-api';

// Types for DeepL API
interface DeepLTranslation {
    detected_source_language: string;
    text: string;
}

interface DeepLResponse {
    translations: DeepLTranslation[];
}

// API configuration
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const TRANSLATION_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Language code mapping for DeepL (uppercase)
const LANGUAGE_CODE_MAP: { [key: string]: string } = {
    en: 'EN',
    es: 'ES',
    ru: 'RU',
    de: 'DE',
    fr: 'FR',
    it: 'IT',
    pt: 'PT',
};

// Delay utility
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

/**
 * Переводит слово через DeepL API с повторными попытками
 * Возвращает до 3 вариантов перевода
 */
export async function translateWithDeepL(
    word: string,
    sourceLanguage: string,
    targetLanguage: string,
    userId: number | null = null,
    maxRetries: number = MAX_RETRIES,
): Promise<{
    mainTranslation: string;
    alternatives: string[];
    error?: string;
}> {
    const apiKey = process.env.DEEPL_API_KEY;

    if (!apiKey) {
        const error = 'DEEPL_API_KEY not found in environment variables';
        console.error(`[DeepL] ${error}`);
        return {
            mainTranslation: '',
            alternatives: [],
            error,
        };
    }

    const sourceLang =
        LANGUAGE_CODE_MAP[sourceLanguage] || sourceLanguage.toUpperCase();
    const targetLang =
        LANGUAGE_CODE_MAP[targetLanguage] || targetLanguage.toUpperCase();

    const requestData = {
        text: word,
        source_lang: sourceLang,
        target_lang: targetLang,
    };

    let lastError: string | undefined = undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const startTime = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(
                () => controller.abort(),
                TRANSLATION_TIMEOUT,
            );

            const params = new URLSearchParams({
                text: word,
                source_lang: sourceLang,
                target_lang: targetLang,
            });

            const response = await fetch(DEEPL_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `DeepL-Auth-Key ${apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const duration = Date.now() - startTime;

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `DeepL API error: ${response.status} ${response.statusText}. ${errorText}`,
                );
            }

            const data: DeepLResponse = await response.json();

            await logApiRequest(
                userId,
                'DEEPL',
                'translate',
                { ...requestData, attempt },
                data,
                response.status,
                null,
                duration,
                sourceLanguage,
                targetLanguage,
            );

            if (!data.translations || data.translations.length === 0) {
                throw new Error('DeepL API returned no translations');
            }

            // DeepL returns one translation, but we can try to get alternatives
            // by requesting translation with small variations (if word/phrase allows)
            // Remove trailing punctuation from translations
            const cleanedTranslation = data.translations[0].text
                .trim()
                .replace(/[,.;:!?]+$/, '');
            const allTranslations: string[] = [cleanedTranslation];

            // Apply filtering
            const filteredTranslations = filterTranslations(allTranslations);

            // Split into main and alternative
            const mainTranslation = filteredTranslations[0];
            const alternatives = filteredTranslations.slice(1);

            console.log(
                `[DeepL] Translation successful on attempt ${attempt}/${maxRetries}`,
            );

            return {
                mainTranslation,
                alternatives,
            };
        } catch (error: any) {
            const duration = Date.now() - startTime;
            lastError =
                error.name === 'AbortError'
                    ? 'Request timeout'
                    : error.message || 'Unknown error';

            await logApiRequest(
                userId,
                'DEEPL',
                'translate',
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
                    `[DeepL] Attempt ${attempt}/${maxRetries} failed: ${lastError}. Retrying...`,
                );
                await delay(RETRY_DELAY * attempt); // Increase delay with each attempt
                continue;
            }

            // If last attempt - return error
            console.error(
                `[DeepL] Failed after ${maxRetries} attempts: ${lastError}`,
            );
            return {
                mainTranslation: '',
                alternatives: [],
                error: lastError,
            };
        }
    }

    return {
        mainTranslation: '',
        alternatives: [],
        error: lastError || 'Unknown error',
    };
}
