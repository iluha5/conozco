import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Flash Cards application E2E tests
 * Uses only Chromium browser for faster test execution
 */
export default defineConfig({
    // Application under test
    testDir: './e2e/tests',

    // Global setup and teardown for starting/stopping test database
    globalSetup: './e2e/global-setup.ts',
    globalTeardown: './e2e/global-teardown.ts',

    // Maximum timeout for a single test
    timeout: 30 * 1000,

    // Timeout for expect assertions
    expect: {
        timeout: 5000,
    },

    // Run tests in parallel
    fullyParallel: true,

    // Prevent test execution if there are compilation errors
    forbidOnly: !!process.env.CI,

    // Retry only in CI
    retries: process.env.CI ? 2 : 0,

    // Number of parallel workers
    workers: process.env.CI ? 4 : 4,

    // Reporter for CI and local development
    reporter: [
        ['html'],
        ['list'],
        ...(process.env.CI ? [['github'] as const] : []),
    ],

    // Shared settings for all projects
    use: {
        // Base URL for the application
        // Uses port 8001 for test application to avoid conflicts with main app (8000)
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8001',

        // Tracing for debugging
        trace: 'on-first-retry',

        // Screenshots only on failure
        screenshot: 'only-on-failure',

        // Video only on failure
        video: 'retain-on-failure',
    },

    // Projects - Chromium only
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Can configure viewport if needed
                // viewport: { width: 1280, height: 720 },
            },
        },
    ],

    // Web server settings for starting application before tests
    // Uses port 8001 and test database for isolation from main application
    webServer: {
        command:
            'DATABASE_URL="postgresql://flashcards_test:flashcards_test_password@localhost:5434/flashcards_test" npm run dev:test',
        url: 'http://localhost:8001',
        reuseExistingServer: !process.env.CI, // Reuse existing server locally
        timeout: 120 * 1000, // 2 minutes to start
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
