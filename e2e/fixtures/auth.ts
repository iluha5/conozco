import { Page } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';
import { createTestUser } from './test-data';
import { LoginPage } from '../page-objects/LoginPage';
import { HeaderPage } from '../page-objects/Header';
import { generateUniqueEmail, generateUniqueName } from '../utils/test-helpers';
import { DEFAULT_TEST_VALUES, TIMEOUTS } from '../utils/constants';

/**
 * Admin password for registration (default from app config)
 */
const ADMIN_REGISTRATION_PASSWORD =
    process.env.ADMIN_REGISTRATION_PASSWORD ||
    DEFAULT_TEST_VALUES.ADMIN_PASSWORD;

/**
 * Test user credentials
 */
export interface TestUserCredentials {
    email: string;
    password: string;
    name?: string;
}

/**
 * Register a user via the registration API
 * @param apiContext Playwright API context
 * @param credentials user credentials
 * @returns created user payload
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
 * Log in via UI (using Page Object)
 * @param page Playwright page
 * @param credentials user credentials
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
    await page.waitForURL('/training/list', {
        timeout: TIMEOUTS.SESSION_SETUP,
    });

    // Additionally wait until page is fully loaded
    await page.waitForLoadState('networkidle');

    await loginPage.expectSuccessfulLogin();
}

/**
 * Log in via API (obtain session)
 * @param apiContext Playwright API context
 * @param credentials user credentials
 * @returns session cookies
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
 * Create a user in the DB and log in via UI
 * Convenience helper to prepare an authenticated user in tests
 * @param page Playwright page
 * @param credentials optional user credentials (generated if omitted)
 * @returns created user credentials with id
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
 * Register a user via API and log in via UI
 * Alternative to direct DB user creation
 * @param page Playwright page
 * @param apiContext Playwright API context
 * @param credentials optional user credentials
 * @returns created user credentials with id
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
 * Log out via UI
 * @param page Playwright page
 */
export async function logoutViaUI(page: Page): Promise<void> {
    const header = new HeaderPage(page);

    await header.logout();
}
