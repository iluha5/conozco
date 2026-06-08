import { APIRequestContext } from '@playwright/test';

/**
 * Base API URL (from Playwright baseURL config)
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8001';

/**
 * Perform a GET request to the API
 * @param apiContext Playwright API context
 * @param endpoint API endpoint (e.g. '/api/words')
 * @param options optional request parameters
 * @returns API response body
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

    // Append query parameters when provided
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
 * Perform a POST request to the API
 * @param apiContext Playwright API context
 * @param endpoint API endpoint
 * @param data request body
 * @param options optional request parameters
 * @returns API response body
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
 * Perform a PUT request to the API
 * @param apiContext Playwright API context
 * @param endpoint API endpoint
 * @param data request body
 * @param options optional request parameters
 * @returns API response body
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
 * Perform a DELETE request to the API
 * @param apiContext Playwright API context
 * @param endpoint API endpoint
 * @param options optional request parameters
 * @returns API response body
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

    // DELETE may not return a response body
    try {
        return await response.json();
    } catch {
        return {} as T;
    }
}

/**
 * Get user words via API
 * @param apiContext Playwright API context
 * @param userId user ID
 * @param options filter options
 * @returns list of words
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
 * Create a word via API
 * @param apiContext Playwright API context
 * @param wordData word data
 * @returns created word
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
 * Update a word via API
 * @param apiContext Playwright API context
 * @param wordId word ID
 * @param wordData update payload
 * @returns updated word
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
 * Delete a word via API
 * @param apiContext Playwright API context
 * @param wordId word ID
 */
export async function deleteWordViaAPI(
    apiContext: APIRequestContext,
    wordId: number,
): Promise<void> {
    await apiDelete(apiContext, `/api/words/${wordId}`);
}

/**
 * Get user word groups via API
 * @param apiContext Playwright API context
 * @param userId user ID
 * @returns list of word groups
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
 * Create a word group via API
 * @param apiContext Playwright API context
 * @param groupData group data
 * @returns created group
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
