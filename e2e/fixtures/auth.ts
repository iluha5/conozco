import { Page } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';
import { createTestUser } from './test-data';
import { LoginPage } from '../page-objects/LoginPage';
import { HeaderPage } from '../page-objects/Header';
import { generateUniqueEmail, generateUniqueName } from '../utils/test-helpers';
import { DEFAULT_TEST_VALUES, TIMEOUTS } from '../utils/constants';

/**
 * Админ пароль для регистрации (по умолчанию из кода)
 */
const ADMIN_REGISTRATION_PASSWORD =
    process.env.ADMIN_REGISTRATION_PASSWORD ||
    DEFAULT_TEST_VALUES.ADMIN_PASSWORD;

/**
 * Данные тестового пользователя
 */
export interface TestUserCredentials {
    email: string;
    password: string;
    name?: string;
}

/**
 * Создает пользователя через API регистрации
 * @param apiContext API контекст Playwright
 * @param credentials Данные пользователя
 * @returns Созданный пользователь
 */
export async function registerUserViaAPI(
    apiContext: APIRequestContext,
    credentials: TestUserCredentials,
): Promise<{ user: any; message: string }> {
    const response = await apiContext.post('/api/auth/register', {
        data: {
            email: credentials.email,
            password: credentials.password,
            name: credentials.name,
            adminPassword: ADMIN_REGISTRATION_PASSWORD,
        },
    });

    if (!response.ok()) {
        const error = await response.json();
        throw new Error(
            `Registration failed: ${error.error || response.statusText()}`,
        );
    }

    return await response.json();
}

/**
 * Авторизует пользователя через UI (используя Page Object)
 * @param page Страница Playwright
 * @param credentials Данные пользователя
 */
export async function loginViaUI(
    page: Page,
    credentials: TestUserCredentials,
): Promise<void> {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(credentials.email, credentials.password);

    // Wait for successful login - redirect to home page
    // May take time to establish NextAuth session
    await page.waitForURL('/', { timeout: TIMEOUTS.SESSION_SETUP });

    // Additionally wait until page is fully loaded
    await page.waitForLoadState('networkidle');

    await loginPage.expectSuccessfulLogin();
}

/**
 * Авторизует пользователя через API (получает сессию)
 * @param apiContext API контекст Playwright
 * @param credentials Данные пользователя
 * @returns Сессионные cookies
 */
export async function loginViaAPI(
    apiContext: APIRequestContext,
    credentials: TestUserCredentials,
): Promise<string[]> {
    // NextAuth uses CSRF token, so easier to authenticate through UI
    // But can use direct request to NextAuth endpoint
    const response = await apiContext.post('/api/auth/callback/credentials', {
        data: {
            email: credentials.email,
            password: credentials.password,
            redirect: false,
        },
    });

    if (!response.ok()) {
        const error = await response.json();
        throw new Error(
            `Login failed: ${error.error || response.statusText()}`,
        );
    }

    // Return cookies from response
    const cookies = response.headers()['set-cookie'] || [];
    return Array.isArray(cookies) ? cookies : [cookies];
}

/**
 * Создает пользователя в БД и авторизует его через UI
 * Удобная функция для быстрой подготовки авторизованного пользователя в тестах
 * @param page Страница Playwright
 * @param credentials Опциональные данные пользователя (если не указаны, создаются автоматически)
 * @returns Данные созданного пользователя
 */
export async function createAndLoginUser(
    page: Page,
    credentials?: Partial<TestUserCredentials>,
): Promise<TestUserCredentials & { id: number }> {
    const email = credentials?.email || generateUniqueEmail();
    const password = credentials?.password || DEFAULT_TEST_VALUES.PASSWORD;
    const name = credentials?.name || generateUniqueName();

    // Get language IDs for default user setup
    const { getLanguageId } = await import('./test-data');
    const enLanguageId = await getLanguageId('en');
    const ruLanguageId = await getLanguageId('ru');

    // Create user in DB with language settings
    const user = await createTestUser(email, password, name, {
        learnLanguageId: enLanguageId,
        ownLanguageId: ruLanguageId,
        interfaceLanguageId: enLanguageId, // Use English for interface in tests
    });

    // Update hasConfigured flag for user (if user exists)
    try {
        const { createTestPrismaClient } = await import('./db');
        const prisma = createTestPrismaClient();
        const existingUser = await prisma.user.findUnique({
            where: { id: user.id },
        });
        if (existingUser) {
            await prisma.user.update({
                where: { id: user.id },
                data: { hasConfigured: true },
            });
        }
        await prisma.$disconnect();
    } catch (error) {
        // Ignore update errors - user may already be configured
    }

    // Authenticate through UI
    await loginViaUI(page, { email, password, name });

    return {
        email,
        password,
        name,
        id: user.id,
    };
}

/**
 * Создает пользователя через API и авторизует его через UI
 * Альтернативный способ создания пользователя (через API вместо прямой записи в БД)
 * @param page Страница Playwright
 * @param apiContext API контекст Playwright
 * @param credentials Опциональные данные пользователя
 * @returns Данные созданного пользователя
 */
export async function registerAndLoginUser(
    page: Page,
    apiContext: APIRequestContext,
    credentials?: Partial<TestUserCredentials>,
): Promise<TestUserCredentials & { id: number }> {
    const email = credentials?.email || generateUniqueEmail();
    const password = credentials?.password || DEFAULT_TEST_VALUES.PASSWORD;
    const name = credentials?.name || generateUniqueName();

    // Register through API
    const result = await registerUserViaAPI(apiContext, {
        email,
        password,
        name,
    });

    // Authenticate through UI
    await loginViaUI(page, { email, password, name });

    return {
        email,
        password,
        name,
        id: result.user.id,
    };
}

/**
 * Выход из системы через UI
 * @param page Страница Playwright
 */
export async function logoutViaUI(page: Page): Promise<void> {
    const header = new HeaderPage(page);

    await header.logout();
}
