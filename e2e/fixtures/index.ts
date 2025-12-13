/**
 * Экспорт всех фикстур и утилит для E2E тестов
 */

// Database utilities
export {
    createTestPrismaClient,
    cleanupTestDatabase,
    withTransaction,
    TEST_DATABASE_URL,
} from './db';

// Test data generators
export {
    createTestUser,
    createTestWord,
    createTestWords,
    createTestWordGroup,
    createTestBaseWord,
    getRoleId,
    getWordStatusId,
    getLanguageId,
} from './test-data';

// Authentication helpers
export {
    registerUserViaAPI,
    loginViaUI,
    loginViaAPI,
    createAndLoginUser,
    registerAndLoginUser,
    logoutViaUI,
    type TestUserCredentials,
} from './auth';

// API helpers
export {
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    getWordsViaAPI,
    createWordViaAPI,
    updateWordViaAPI,
    deleteWordViaAPI,
    getWordGroupsViaAPI,
    createWordGroupViaAPI,
} from './api-helpers';

// Training fixtures
export {
    setupTrainingWithWords,
    openTrainingStage,
    createTrainingWordPair,
    type TrainingWordPair,
    type TrainingSetupResult,
} from './training';
