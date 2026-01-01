import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS, SELECTORS } from '../utils/constants';

/**
 * Page Object для страницы входа
 */
export class LoginPage extends BasePage {
    // Селекторы
    private readonly emailInput = 'input[type="email"]';
    private readonly passwordInput = 'input[type="password"]';
    private readonly submitButton = 'button[type="submit"]';
    private readonly registerLink = 'a[href="/auth/register"]';
    private readonly cardTitle = 'h3:has-text("Login")'; // Используем более специфичный селектор

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
     * Клик по кнопке отправки формы
     */
    async clickSubmit() {
        await this.click(this.submitButton);
    }

    /**
     * Выполнение входа
     */
    async login(email: string, password: string) {
        await this.enterEmail(email);
        await this.enterPassword(password);

        // Кликаем по кнопке отправки
        await this.clickSubmit();

        // Ждем обработки формы (может быть редирект или ошибка)
        // Не ждем конкретного URL здесь, так как это зависит от результата
        await this.page.waitForLoadState('networkidle', { timeout: 5000 });
    }

    /**
     * Клик по ссылке регистрации
     */
    async clickRegisterLink() {
        await this.click(this.registerLink);
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
     * Проверка успешного входа (редирект на главную)
     */
    async expectSuccessfulLogin() {
        await this.expectUrl('/');
    }
}
