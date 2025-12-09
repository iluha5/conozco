import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object для страницы входа
 */
export class LoginPage extends BasePage {
    // Селекторы
    private readonly emailInput = 'input[type="email"]';
    private readonly passwordInput = 'input[type="password"]';
    private readonly submitButton = 'button[type="submit"]';
    private readonly registerLink = 'a[href="/auth/register"]';
    private readonly cardTitle = 'text=Вход';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Переход на страницу входа
     */
    async goto() {
        await super.goto('/auth/login');
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
        await this.fill(this.emailInput, email);
    }

    /**
     * Ввод пароля
     */
    async enterPassword(password: string) {
        await this.fill(this.passwordInput, password);
    }

    /**
     * Выполнение входа
     */
    async login(email: string, password: string) {
        await this.enterEmail(email);
        await this.enterPassword(password);
        await this.click(this.submitButton);
        await this.waitForNavigation();
    }

    /**
     * Клик по ссылке регистрации
     */
    async clickRegisterLink() {
        await this.click(this.registerLink);
        await this.waitForNavigation();
    }

    /**
     * Проверка наличия ошибки
     */
    async expectError(message?: string) {
        const errorElement = this.page.locator(
            'text=/Ошибка|Неверный|ошибка/i',
        );
        await expect(errorElement.first()).toBeVisible();
        if (message) {
            await expect(errorElement.first()).toContainText(message);
        }
    }

    /**
     * Проверка успешного входа (редирект на главную)
     */
    async expectSuccessfulLogin() {
        await this.expectUrl('/');
    }
}
