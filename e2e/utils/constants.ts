/**
 * Константы для E2E тестов
 */

/**
 * Таймауты для различных операций (в миллисекундах)
 */
export const TIMEOUTS = {
    /** Таймаут для навигации и загрузки страниц */
    NAVIGATION: 10000,
    /** Таймаут для ожидания элементов */
    ELEMENT: 5000,
    /** Таймаут для API запросов */
    API: 10000,
    /** Таймаут для установки сессии после авторизации */
    SESSION_SETUP: 10000,
    /** Таймаут для появления toast сообщений */
    TOAST: 5000,
} as const;

/**
 * Дефолтные значения для тестовых данных
 */
export const DEFAULT_TEST_VALUES = {
    /** Дефолтный пароль для тестовых пользователей */
    PASSWORD: 'testpassword123',
    /** Дефолтный admin пароль для регистрации */
    ADMIN_PASSWORD: 'admin123',
    /** Дефолтный язык для тестов */
    LANGUAGE_CODE: 'en',
    /** Дефолтный статус слова */
    WORD_STATUS: 'NOT_LEARNED' as const,
} as const;

/**
 * Селекторы для общих элементов
 */
export const SELECTORS = {
    /** Селектор для toast сообщений */
    TOAST_ERROR: 'text=/Ошибка|Неверный|ошибка/i',
    /** Селектор для loading индикаторов */
    LOADING: '[data-testid="loading"], .loading, [aria-busy="true"]',
    /** Селектор для header */
    HEADER: '[data-test="header-wrapper"]',
} as const;
