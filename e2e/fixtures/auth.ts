import { Page } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';
import { createTestUser } from './test-data';
import { LoginPage } from '../page-objects/LoginPage';
import { HeaderPage } from '../page-objects/Header';

/**
 * Админ пароль для регистрации (по умолчанию из кода)
 */
const ADMIN_REGISTRATION_PASSWORD =
    process.env.ADMIN_REGISTRATION_PASSWORD || 'admin123';

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
    // NextAuth использует CSRF токен, поэтому проще авторизоваться через UI
    // Но можно использовать прямой запрос к NextAuth endpoint
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

    // Возвращаем cookies из ответа
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
    const email = credentials?.email || `test-${Date.now()}@example.com`;
    const password = credentials?.password || 'testpassword123';
    const name = credentials?.name || `Test User ${Date.now()}`;

    // Создаем пользователя в БД
    const user = await createTestUser(email, password, name);

    // Авторизуем через UI
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
    const email = credentials?.email || `test-${Date.now()}@example.com`;
    const password = credentials?.password || 'testpassword123';
    const name = credentials?.name || `Test User ${Date.now()}`;

    // Регистрируем через API
    const result = await registerUserViaAPI(apiContext, {
        email,
        password,
        name,
    });

    // Авторизуем через UI
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
