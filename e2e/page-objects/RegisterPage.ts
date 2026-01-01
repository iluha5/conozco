import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS, SELECTORS } from '../utils/constants';

/**
 * Page Object для страницы регистрации
 */
export class RegisterPage extends BasePage {
    // Селекторы
    private readonly emailInput = 'input[type="email"]';
    private readonly nameInput = 'input[type="text"]';
    private readonly passwordInputs = 'input[type="password"]';
    private readonly submitButton = 'button[type="submit"]';
    private readonly loginLink = 'a[href="/auth/login"]';
    private readonly cardTitle = 'h3:has-text("Registration")'; // Используем более специфичный селектор

    constructor(page: Page) {
        super(page);
    }

    /**
     * Переход на страницу регистрации
     */
    async goto() {
        await super.goto('/auth/register');
        await this.waitForLoadState();
    }

    /**
     * Проверка, что страница загружена
     */
    async expectPageLoaded() {
        await expect(this.page.locator(this.cardTitle)).toBeVisible();
    }

    /**
     * Ввод email
     */
    async enterEmail(email: string) {
        const emailField = this.page.locator(this.emailInput).first();
        await emailField.fill(email);
    }

    /**
     * Ввод имени
     */
    async enterName(name: string) {
        await this.fill(this.nameInput, name);
    }

    /**
     * Ввод пароля (первое поле)
     */
    async enterPassword(password: string) {
        const passwordFields = this.page.locator(this.passwordInputs);
        await passwordFields.first().fill(password);
    }

    /**
     * Ввод пароля администратора (второе поле)
     */
    async enterAdminPassword(adminPassword: string) {
        const passwordFields = this.page.locator(this.passwordInputs);
        await passwordFields.nth(1).fill(adminPassword);
    }

    /**
     * Клик по кнопке отправки формы
     */
    async clickSubmit() {
        await this.click(this.submitButton);
    }

    /**
     * Выполнение регистрации
     */
    async register(
        email: string,
        password: string,
        adminPassword: string,
        name?: string,
    ) {
        await this.enterEmail(email);
        if (name) {
            await this.enterName(name);
        }
        await this.enterPassword(password);
        await this.enterAdminPassword(adminPassword);
        // Ждем либо редирект на логин (успех), либо остаемся на странице регистрации (ошибка)
        await Promise.all([
            this.page.waitForURL(/\/auth\/(login|register)/, {
                timeout: 5000,
            }),
            this.clickSubmit(),
        ]);
    }

    /**
     * Клик по ссылке входа
     */
    async clickLoginLink() {
        await this.click(this.loginLink);
        await this.waitForLoadState();
    }

    /**
     * Проверка наличия ошибки
     * Ищет ошибку в toast сообщении (description), а не в заголовке
     */
    async expectError(message?: string) {
        // Ищем toast с ошибкой
        // Toast может быть в разных местах, используем более широкий поиск
        const errorText = this.page.locator(SELECTORS.TOAST_ERROR);

        // Ждем появления toast с ошибкой (может появиться с задержкой)
        await expect(errorText.first()).toBeVisible({
            timeout: TIMEOUTS.TOAST,
        });

        if (message) {
            // Проверяем текст ошибки в toast
            await expect(errorText.first()).toContainText(message, {
                ignoreCase: true,
            });
        }
    }

    /**
     * Проверка успешной регистрации (редирект на страницу входа)
     */
    async expectSuccessfulRegistration() {
        await this.expectUrl('/auth/login');
    }
}
