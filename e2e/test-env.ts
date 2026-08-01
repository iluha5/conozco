export const TEST_DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    'postgresql://flashcards_test:flashcards_test_password@localhost:5434/flashcards_test';

export const PLAYWRIGHT_BASE_URL =
    process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8001';

export const TEST_NEXTAUTH_URL =
    process.env.NEXTAUTH_URL || PLAYWRIGHT_BASE_URL;
