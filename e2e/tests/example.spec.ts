import { test, expect } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';

/**
 * Пример теста для проверки конфигурации Playwright
 * Демонстрирует использование Page Object Model
 */
test('проверка базовой конфигурации', async ({ page }) => {
    const homePage = new HomePage(page);

    // Используем Page Object для навигации
    await homePage.goto();

    // Проверяем, что страница загрузилась
    await homePage.expectPageLoaded();

    // Проверяем заголовок страницы
    await expect(page).toHaveTitle(/Flash Cards/i);
});
