/**
 * Utilities for generating unique test data
 */

/**
 * Generate a unique email for tests
 * Uses timestamp + random for uniqueness even when tests run in parallel
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `${prefix}-${timestamp}-${random}@example.com`;
}

/**
 * Generate a unique user name for tests
 */
export function generateUniqueName(prefix: string = 'Test User'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix} ${timestamp}-${random}`;
}

/**
 * Generate a unique group name for tests
 */
export function generateUniqueGroupName(prefix: string = 'test-group'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}-${timestamp}-${random}`;
}
