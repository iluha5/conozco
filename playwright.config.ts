import { defineConfig, devices } from '@playwright/test';

/**
 * Конфигурация Playwright для E2E тестов Flash Cards приложения
 * Используется только Chromium браузер для ускорения тестов
 */
export default defineConfig({
    // Тестируемое приложение
    testDir: './e2e/tests',

    // Global setup и teardown для запуска/остановки тестовой БД
    globalSetup: './e2e/global-setup.ts',
    globalTeardown: './e2e/global-teardown.ts',

    // Максимальное время выполнения одного теста
    timeout: 30 * 1000,

    // Таймаут для expect assertions
    expect: {
        timeout: 5000,
    },

    // Параллельный запуск тестов
    fullyParallel: true,

    // Запретить запуск тестов, если есть ошибки компиляции
    forbidOnly: !!process.env.CI,

    // Retry только в CI
    retries: process.env.CI ? 2 : 0,

    // Количество параллельных воркеров
    workers: process.env.CI ? 4 : 4,

    // Репортер для CI и локальной разработки
    reporter: [
        ['html'],
        ['list'],
        ...(process.env.CI ? [['github'] as const] : []),
    ],

    // Общие настройки для всех проектов
    use: {
        // Базовый URL приложения
        // Используется порт 8001 для тестового приложения, чтобы не конфликтовать с основным (8000)
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8001',

        // Трассировка для отладки
        trace: 'on-first-retry',

        // Скриншоты только при падении
        screenshot: 'only-on-failure',

        // Видео только при падении
        video: 'retain-on-failure',
    },

    // Проекты - только Chromium
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Можно настроить viewport если нужно
                // viewport: { width: 1280, height: 720 },
            },
        },
    ],

    // Настройки веб-сервера для запуска приложения перед тестами
    // Используется порт 8001 и тестовая БД для изоляции от основного приложения
    webServer: {
        command:
            'DATABASE_URL="postgresql://flashcards_test:flashcards_test_password@localhost:5434/flashcards_test" npm run dev:test',
        url: 'http://localhost:8001',
        reuseExistingServer: !process.env.CI, // Переиспользовать существующий сервер локально
        timeout: 120 * 1000, // 2 минуты на запуск
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
