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

// Типы для Tatoeba
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

// Типы для результатов
export interface TranslationResult {
    word: string;
    sourceLanguage: string;
    targetLanguage: string;
    mainTranslation: string;
    alternativeTranslations: string[];
    examples: Array<{
        sentence: string;
        translation: string;
        sentenceId?: number;
    }>;
}

// Конфигурация API
// MyMemory Translation API - бесплатный, без API ключа
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net';
const TRANSLATION_TIMEOUT = 10000; // 10 секунд
const TATOEBA_API_URL = 'https://tatoeba.org/en/api_v0';
const TATOEBA_MAX_RETRIES = 3;
const TATOEBA_RETRY_DELAY = 2000; // 2 секунды

// Маппинг языковых кодов для Tatoeba
const LANGUAGE_CODE_MAP: { [key: string]: string } = {
    en: 'eng',
    es: 'spa',
    ru: 'rus',
};

// Утилита для логирования запросов к API
async function logApiRequest(
    userId: number | null,
    serviceName: string,
    requestType: string,
    requestData: any,
    responseData: any | null,
    statusCode: number | null,
    errorMessage: string | null,
    duration: number,
) {
    try {
        console.log(
            `[LOG] Attempting to log API request: ${serviceName}/${requestType}`,
        );

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
                serviceName,
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
            serviceName,
            requestType,
            statusCode,
            errorMessage,
            duration,
        });
    }
}

// Утилита для задержки
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Проверяет, содержит ли строка латинские символы
 */
function hasLatinCharacters(text: string): boolean {
    // Проверяем наличие латинских букв (a-z, A-Z)
    return /[a-zA-Z]/.test(text);
}

/**
 * Удаляет все знаки препинания из строки для сравнения
 */
function removePunctuation(text: string): string {
    // Удаляем все символы кроме букв (кириллица, латиница), цифр и пробелов
    return text
        .replace(/[^а-яА-ЯёЁa-zA-Z0-9\s]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Фильтрует переводы по критериям качества
 */
function filterTranslations(translations: string[]): string[] {
    if (translations.length === 0) {
        return translations;
    }

    // Сохраняем оригинальные переводы на случай, если все будут отфильтрованы
    const originalTranslations = [...translations];

    // 1. Фильтруем переводы с латинскими символами
    let filtered = translations.filter(t => !hasLatinCharacters(t));

    // 2. Удаляем дубликаты (сравниваем без знаков препинания)
    const seen = new Set<string>();
    filtered = filtered.filter(translation => {
        const normalized = removePunctuation(translation);
        if (seen.has(normalized)) {
            return false;
        }
        seen.add(normalized);
        return true;
    });

    // 3. Если после фильтрации не осталось ни одного перевода - возвращаем первый оригинальный
    if (filtered.length === 0) {
        return [originalTranslations[0]];
    }

    return filtered;
}

/**
 * Проверяет, что предложение и перевод различаются
 * (после нормализации - удаления знаков препинания и приведения к нижнему регистру)
 */
function areSentencesDifferent(sentence: string, translation: string): boolean {
    const normalizedSentence = removePunctuation(sentence);
    const normalizedTranslation = removePunctuation(translation);

    return normalizedSentence !== normalizedTranslation;
}

/**
 * Переводит слово через MyMemory Translation API
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
            'MyMemory',
            'translate',
            requestData,
            data,
            response.status,
            null,
            duration,
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
        const allTranslations: string[] = [data.responseData.translatedText];

        if (data.matches && Array.isArray(data.matches)) {
            for (const match of data.matches) {
                if (
                    match.translation &&
                    match.translation !== data.responseData.translatedText &&
                    allTranslations.length < 3 // Ограничиваем до 3 переводов
                ) {
                    allTranslations.push(match.translation);
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
            'MyMemory',
            'translate',
            requestData,
            null,
            null,
            errorMessage,
            duration,
        );

        return {
            mainTranslation: '',
            alternatives: [],
            error: errorMessage,
        };
    }
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
                'Tatoeba',
                'search_examples',
                { ...requestData, attempt },
                data,
                response.status,
                null,
                duration,
            );

            if (!response.ok) {
                throw new Error(
                    `Tatoeba API error: ${response.status} ${response.statusText}`,
                );
            }

            // Обрабатываем результаты
            const examples: Array<{
                sentence: string;
                translation: string;
                sentenceId: number;
            }> = [];

            for (const result of data.results) {
                // Tatoeba API возвращает translations как массив массивов
                // translations[0] - indirect translations
                // translations[1] - direct translations (которые нам нужны)
                if (
                    result.translations &&
                    Array.isArray(result.translations) &&
                    result.translations.length > 1 &&
                    Array.isArray(result.translations[1]) &&
                    result.translations[1].length > 0
                ) {
                    const translation = result.translations[1][0];
                    // Проверяем что перевод содержит текст
                    if (translation && translation.text) {
                        // Проверяем что предложение и перевод различаются
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

                // Ограничиваем до 10 примеров
                if (examples.length >= 10) {
                    break;
                }
            }

            // Если нашли примеры - возвращаем
            if (examples.length > 0) {
                return examples;
            }

            // Если это не последняя попытка и примеров нет - пробуем еще раз
            if (attempt < maxRetries) {
                console.log(
                    `Tatoeba: No examples found for "${word}", retrying (${attempt}/${maxRetries})...`,
                );
                await delay(TATOEBA_RETRY_DELAY);
                continue;
            }

            // Если это последняя попытка и примеров нет - возвращаем пустой массив
            return [];
        } catch (error: any) {
            const duration = Date.now() - startTime;
            lastError = error.message || 'Unknown error';

            await logApiRequest(
                userId,
                'Tatoeba',
                'search_examples',
                { ...requestData, attempt },
                null,
                null,
                lastError,
                duration,
            );

            // Если это не последняя попытка - пробуем еще раз
            if (attempt < maxRetries) {
                console.log(
                    `Tatoeba error (attempt ${attempt}/${maxRetries}):`,
                    lastError,
                );
                await delay(TATOEBA_RETRY_DELAY);
                continue;
            }

            // Если это последняя попытка - возвращаем пустой массив
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
        // Параллельно запрашиваем перевод и примеры
        const [translationResult, examples] = await Promise.all([
            translateWord(word, sourceLanguage, targetLanguage, userId),
            searchExamples(word, sourceLanguage, targetLanguage, userId, 1), // Первая попытка
        ]);

        // Если перевод не удалось получить - возвращаем ошибку
        if (translationResult.error || !translationResult.mainTranslation) {
            return {
                error:
                    translationResult.error ||
                    'Failed to translate word. Please try again.',
            };
        }

        // Если примеры не найдены - запускаем фоновый поиск
        if (examples.length === 0) {
            // Запускаем фоновый поиск (без await)
            searchExamples(word, sourceLanguage, targetLanguage, userId, 3)
                .then(backgroundExamples => {
                    if (backgroundExamples.length > 0) {
                        console.log(
                            `Found ${backgroundExamples.length} examples in background for "${word}"`,
                        );
                        // В реальном приложении здесь можно обновить данные в БД или уведомить пользователя
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
