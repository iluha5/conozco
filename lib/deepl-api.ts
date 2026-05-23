import { filterTranslations } from './translation-api';

interface DeepLTranslation {
    detected_source_language: string;
    text: string;
}

interface DeepLResponse {
    translations: DeepLTranslation[];
}

const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';
const TRANSLATION_TIMEOUT = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const LANGUAGE_CODE_MAP: { [key: string]: string } = {
    en: 'EN',
    es: 'ES',
    ru: 'RU',
    de: 'DE',
    fr: 'FR',
    it: 'IT',
    pt: 'PT',
};

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

// Up to `maxRetries` attempts with linear back-off (RETRY_DELAY * attempt).
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
        return { mainTranslation: '', alternatives: [], error };
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

    let lastError: string | undefined;

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

            const cleanedTranslation = data.translations[0].text
                .trim()
                .replace(/[,.;:!?]+$/, '');
            const filteredTranslations = filterTranslations([
                cleanedTranslation,
            ]);

            return {
                mainTranslation: filteredTranslations[0],
                alternatives: filteredTranslations.slice(1),
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

            if (attempt < maxRetries) {
                await delay(RETRY_DELAY * attempt);
                continue;
            }

            console.error(
                `[DeepL] failed after ${maxRetries} attempts: ${lastError}`,
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
