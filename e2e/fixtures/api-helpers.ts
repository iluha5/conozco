import { APIRequestContext } from '@playwright/test';

/**
 * Базовый URL API (берется из baseURL конфигурации Playwright)
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8001';

/**
 * Выполняет GET запрос к API
 * @param apiContext API контекст Playwright
 * @param endpoint Endpoint API (например, '/api/words')
 * @param options Опциональные параметры запроса
 * @returns Ответ API
 */
export async function apiGet<T = any>(
    apiContext: APIRequestContext,
    endpoint: string,
    options?: {
        headers?: Record<string, string>;
        params?: Record<string, string | number>;
    },
): Promise<T> {
    let url = endpoint.startsWith('/') ? `${BASE_URL}${endpoint}` : endpoint;

    // Добавляем query параметры если есть
    if (options?.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });
        url += `?${searchParams.toString()}`;
    }

    const response = await apiContext.get(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok()) {
        const error = await response
            .json()
            .catch(() => ({ error: response.statusText() }));
        throw new Error(
            `API GET failed: ${error.error || response.statusText()}`,
        );
    }

    return await response.json();
}

/**
 * Выполняет POST запрос к API
 * @param apiContext API контекст Playwright
 * @param endpoint Endpoint API
 * @param data Данные для отправки
 * @param options Опциональные параметры запроса
 * @returns Ответ API
 */
export async function apiPost<T = any>(
    apiContext: APIRequestContext,
    endpoint: string,
    data?: any,
    options?: {
        headers?: Record<string, string>;
    },
): Promise<T> {
    const url = endpoint.startsWith('/') ? `${BASE_URL}${endpoint}` : endpoint;

    const response = await apiContext.post(url, {
        data,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok()) {
        const error = await response
            .json()
            .catch(() => ({ error: response.statusText() }));
        throw new Error(
            `API POST failed: ${error.error || response.statusText()}`,
        );
    }

    return await response.json();
}

/**
 * Выполняет PUT запрос к API
 * @param apiContext API контекст Playwright
 * @param endpoint Endpoint API
 * @param data Данные для отправки
 * @param options Опциональные параметры запроса
 * @returns Ответ API
 */
export async function apiPut<T = any>(
    apiContext: APIRequestContext,
    endpoint: string,
    data?: any,
    options?: {
        headers?: Record<string, string>;
    },
): Promise<T> {
    const url = endpoint.startsWith('/') ? `${BASE_URL}${endpoint}` : endpoint;

    const response = await apiContext.put(url, {
        data,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok()) {
        const error = await response
            .json()
            .catch(() => ({ error: response.statusText() }));
        throw new Error(
            `API PUT failed: ${error.error || response.statusText()}`,
        );
    }

    return await response.json();
}

/**
 * Выполняет DELETE запрос к API
 * @param apiContext API контекст Playwright
 * @param endpoint Endpoint API
 * @param options Опциональные параметры запроса
 * @returns Ответ API
 */
export async function apiDelete<T = any>(
    apiContext: APIRequestContext,
    endpoint: string,
    options?: {
        headers?: Record<string, string>;
    },
): Promise<T> {
    const url = endpoint.startsWith('/') ? `${BASE_URL}${endpoint}` : endpoint;

    const response = await apiContext.delete(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok()) {
        const error = await response
            .json()
            .catch(() => ({ error: response.statusText() }));
        throw new Error(
            `API DELETE failed: ${error.error || response.statusText()}`,
        );
    }

    // DELETE может не возвращать тело ответа
    try {
        return await response.json();
    } catch {
        return {} as T;
    }
}

/**
 * Получает список слов пользователя через API
 * @param apiContext API контекст Playwright
 * @param userId ID пользователя
 * @param options Опции фильтрации
 * @returns Список слов
 */
export async function getWordsViaAPI(
    apiContext: APIRequestContext,
    userId: number,
    options?: {
        languageId?: number;
        statusId?: number;
        search?: string;
    },
): Promise<any[]> {
    return apiGet(apiContext, `/api/words`, {
        params: {
            userId,
            ...options,
        } as any,
    });
}

/**
 * Создает слово через API
 * @param apiContext API контекст Playwright
 * @param wordData Данные слова
 * @returns Созданное слово
 */
export async function createWordViaAPI(
    apiContext: APIRequestContext,
    wordData: {
        baseWordId?: number;
        customWord?: string;
        languageId: number;
        statusId?: number;
    },
): Promise<any> {
    return apiPost(apiContext, '/api/words', wordData);
}

/**
 * Обновляет слово через API
 * @param apiContext API контекст Playwright
 * @param wordId ID слова
 * @param wordData Данные для обновления
 * @returns Обновленное слово
 */
export async function updateWordViaAPI(
    apiContext: APIRequestContext,
    wordId: number,
    wordData: Partial<{
        statusId: number;
        selectedTranslationId: number;
    }>,
): Promise<any> {
    return apiPut(apiContext, `/api/words/${wordId}`, wordData);
}

/**
 * Удаляет слово через API
 * @param apiContext API контекст Playwright
 * @param wordId ID слова
 */
export async function deleteWordViaAPI(
    apiContext: APIRequestContext,
    wordId: number,
): Promise<void> {
    await apiDelete(apiContext, `/api/words/${wordId}`);
}

/**
 * Получает группы слов пользователя через API
 * @param apiContext API контекст Playwright
 * @param userId ID пользователя
 * @returns Список групп слов
 */
export async function getWordGroupsViaAPI(
    apiContext: APIRequestContext,
    userId: number,
): Promise<any[]> {
    return apiGet(apiContext, `/api/user/word-groups`, {
        params: {
            userId,
        } as any,
    });
}

/**
 * Создает группу слов через API
 * @param apiContext API контекст Playwright
 * @param groupData Данные группы
 * @returns Созданная группа
 */
export async function createWordGroupViaAPI(
    apiContext: APIRequestContext,
    groupData: {
        name: string;
        languageId: number;
        visibility?: 'PRIVATE' | 'PUBLIC';
    },
): Promise<any> {
    return apiPost(apiContext, '/api/user/word-groups', groupData);
}
