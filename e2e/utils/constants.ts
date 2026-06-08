/**
 * Constants for E2E tests
 */

/**
 * Timeouts for various operations (milliseconds)
 */
export const TIMEOUTS = {
    /** Navigation and page load timeout */
    NAVIGATION: 10000,
    /** Element wait timeout */
    ELEMENT: 5000,
    /** API request timeout */
    API: 10000,
    /** Session setup timeout after login */
    SESSION_SETUP: 10000,
    /** Toast message appearance timeout */
    TOAST: 5000,
} as const;

/**
 * Default values for test data
 */
export const DEFAULT_TEST_VALUES = {
    /** Default password for test users */
    PASSWORD: 'testpassword123',
    /** Default admin password for registration */
    ADMIN_PASSWORD: 'admin123',
    /** Default language code for tests */
    LANGUAGE_CODE: 'en',
    /** Default word status */
    WORD_STATUS: 'NOT_LEARNED' as const,
} as const;

/**
 * Selectors for shared UI elements
 */
export const SELECTORS = {
    /** Toast message selector */
    TOAST_ERROR: 'text=/Error|Invalid|error/i',
    /** Loading indicator selector */
    LOADING: '[data-testid="loading"], .loading, [aria-busy="true"]',
    /** Header selector */
    HEADER: '[data-test="header-wrapper"]',
} as const;
