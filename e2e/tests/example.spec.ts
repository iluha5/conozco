import { test, expect } from '@playwright/test';

/**
 * Пример теста для проверки конфигурации Playwright
 * Этот файл можно удалить после создания реальных тестов
 */
test('проверка базовой конфигурации', async ({ page }) => {
    // Проверяем, что можем открыть базовый URL
    await page.goto('/');

    // Проверяем, что страница загрузилась
    await expect(page).toHaveTitle(/Flash Cards/i);
});
