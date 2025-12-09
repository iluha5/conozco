/**
 * Утилиты для генерации уникальных тестовых данных
 */

/**
 * Генерирует уникальный email для тестов
 * Использует комбинацию timestamp и random для гарантированной уникальности
 * даже при параллельном запуске тестов
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `${prefix}-${timestamp}-${random}@example.com`;
}

/**
 * Генерирует уникальное имя пользователя для тестов
 */
export function generateUniqueName(prefix: string = 'Test User'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix} ${timestamp}-${random}`;
}

/**
 * Генерирует уникальное имя группы для тестов
 */
export function generateUniqueGroupName(prefix: string = 'test-group'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}-${timestamp}-${random}`;
}
