import { filterTranslations } from './translation-api';

// Типы для MyMemory Translation API
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

// Конфигурация API
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net';
const TRANSLATION_TIMEOUT = 10000; // 10 секунд

// Утилита для получения ID источника по коду
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

// Утилита для получения ID языка по коду
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

// Утилита для логирования запросов к API
async function logApiRequest(
    userId: number | null,
    sourceCode: string, // 'DEEPL', 'MYMEMORY', 'TATOEBA'
    requestType: string,
    requestData: any,
    responseData: any | null,
    statusCode: number | null,
    errorMessage: string | null | undefined,
    duration: number,
    sourceLanguageCode?: string, // Код исходного языка (например: 'es', 'en')
    targetLanguageCode?: string, // Код целевого языка (например: 'ru')
) {
    try {
        console.log(
            `[LOG] Attempting to log API request: ${sourceCode}/${requestType}`,
        );

        // Получаем sourceId
        const sourceId = await getSourceId(sourceCode);

        if (!sourceId) {
            console.error(`[LOG] Failed to get sourceId for "${sourceCode}"`);
            return;
        }

        // Получаем language IDs если они указаны
        let sourceLanguageId: number | null | undefined = undefined;
        let targetLanguageId: number | null | undefined = undefined;

        if (sourceLanguageCode) {
            sourceLanguageId = await getLanguageId(sourceLanguageCode);
        }

        if (targetLanguageCode) {
            targetLanguageId = await getLanguageId(targetLanguageCode);
        }

        // Импортируем prisma внутри функции для гарантии серверного контекста
        const { prisma } = await import('./prisma');

        if (!prisma) {
            console.error('[LOG] Prisma client is undefined!');
            return;
        }

        // Безопасная сериализация данных
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
 * Переводит слово через MyMemory Translation API
 */
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
    const requestData = {
        q: word,
        langpair,
    };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            TRANSLATION_TIMEOUT,
        );

        const params = new URLSearchParams({
            q: word,
            langpair,
        });

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

        // Собираем все переводы (главный + альтернативные из matches)
        // Убираем trailing знаки препинания из переводов
        const cleanMainTranslation = data.responseData.translatedText
            .trim()
            .replace(/[,.;:!?]+$/, '');
        const allTranslations: string[] = [cleanMainTranslation];

        if (data.matches && Array.isArray(data.matches)) {
            for (const match of data.matches) {
                if (
                    match.translation &&
                    match.translation !== data.responseData.translatedText &&
                    allTranslations.length < 3 // Ограничиваем до 3 переводов
                ) {
                    const cleanTranslation = match.translation
                        .trim()
                        .replace(/[,.;:!?]+$/, '');
                    allTranslations.push(cleanTranslation);
                }
            }
        }

        // Применяем фильтрацию
        const filteredTranslations = filterTranslations(allTranslations);

        // Разделяем на главный и альтернативные
        const mainTranslation = filteredTranslations[0];
        const alternatives = filteredTranslations.slice(1);

        return {
            mainTranslation,
            alternatives,
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
