import { filterTranslations } from './translation-api';

interface MyMemoryResponse {
    responseData: {
        translatedText: string;
        match: number;
    };
    quotaFinished: boolean;
    mtLangSupported: null | string;
    responseDetails: string;
    responseStatus: number;
    matches: Array<{
        id: string;
        segment: string;
        translation: string;
        quality: string;
        reference: string;
        'usage-count': number;
        subject: string;
        'created-by': string;
        'last-updated-by': string;
        'create-date': string;
        'last-update-date': string;
        match: number;
    }>;
}

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net';
const TRANSLATION_TIMEOUT = 10000;

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

export async function translateWithMyMemory(
    word: string,
    sourceLanguage: string,
    targetLanguage: string,
    userId: number | null = null,
): Promise<{
    mainTranslation: string;
    alternatives: string[];
    error?: string;
}> {
    const startTime = Date.now();
    const langpair = `${sourceLanguage}|${targetLanguage}`;
    const requestData = { q: word, langpair };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            TRANSLATION_TIMEOUT,
        );

        const params = new URLSearchParams({ q: word, langpair });

        const response = await fetch(`${MYMEMORY_API_URL}/get?${params}`, {
            method: 'GET',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const duration = Date.now() - startTime;
        const data: MyMemoryResponse = await response.json();

        await logApiRequest(
            userId,
            'MYMEMORY',
            'translate',
            requestData,
            data,
            response.status,
            null,
            duration,
            sourceLanguage,
            targetLanguage,
        );

        if (!response.ok) {
            throw new Error(
                `MyMemory API error: ${response.status} ${response.statusText}`,
            );
        }

        if (data.responseStatus !== 200) {
            throw new Error(
                `MyMemory API error: ${data.responseDetails || 'Unknown error'}`,
            );
        }

        const cleanMainTranslation = data.responseData.translatedText
            .trim()
            .replace(/[,.;:!?]+$/, '');
        const allTranslations: string[] = [cleanMainTranslation];

        // Collect up to 2 alternative translations from `matches`, skipping the duplicate of the main one.
        if (data.matches && Array.isArray(data.matches)) {
            for (const match of data.matches) {
                if (
                    match.translation &&
                    match.translation !== data.responseData.translatedText &&
                    allTranslations.length < 3
                ) {
                    allTranslations.push(
                        match.translation.trim().replace(/[,.;:!?]+$/, ''),
                    );
                }
            }
        }

        const filteredTranslations = filterTranslations(allTranslations);

        return {
            mainTranslation: filteredTranslations[0],
            alternatives: filteredTranslations.slice(1),
        };
    } catch (error: any) {
        const duration = Date.now() - startTime;
        const errorMessage =
            error.name === 'AbortError'
                ? 'Request timeout'
                : error.message || 'Unknown error';

        await logApiRequest(
            userId,
            'MYMEMORY',
            'translate',
            requestData,
            null,
            null,
            errorMessage,
            duration,
            sourceLanguage,
            targetLanguage,
        );

        return {
            mainTranslation: '',
            alternatives: [],
            error: errorMessage,
        };
    }
}
