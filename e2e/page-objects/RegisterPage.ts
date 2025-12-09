import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

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
    private readonly cardTitle = 'text=Регистрация';

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
        await this.click(this.submitButton);
        await this.waitForNavigation();
    }

    /**
     * Клик по ссылке входа
     */
    async clickLoginLink() {
        await this.click(this.loginLink);
        await this.waitForNavigation();
    }

    /**
     * Проверка наличия ошибки
     */
    async expectError(message?: string) {
        const errorElement = this.page.locator('text=/Ошибка|ошибка/i');
        await expect(errorElement.first()).toBeVisible();
        if (message) {
            await expect(errorElement.first()).toContainText(message);
        }
    }

    /**
     * Проверка успешной регистрации (редирект на страницу входа)
     */
    async expectSuccessfulRegistration() {
        await this.expectUrl('/auth/login');
    }
}
