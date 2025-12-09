import { defineConfig, devices } from '@playwright/test';

/**
 * Конфигурация Playwright для E2E тестов Flash Cards приложения
 * Используется только Chromium браузер для ускорения тестов
 */
export default defineConfig({
    // Тестируемое приложение
    testDir: './e2e/tests',

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
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8000',

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

    // Настройки веб-сервера для запуска приложения перед тестами (опционально)
    // webServer: {
    //     command: 'npm run dev',
    //     url: 'http://localhost:8000',
    //     reuseExistingServer: !process.env.CI,
    //     timeout: 120 * 1000,
    // },
});
