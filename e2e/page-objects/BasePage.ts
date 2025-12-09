import { Page, expect } from '@playwright/test';

/**
 * Базовый класс для всех Page Objects
 * Содержит общие методы для навигации и ожидания
 */
export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Переход на страницу
     */
    async goto(path: string = '') {
        await this.page.goto(path);
    }

    /**
     * Ожидание загрузки страницы
     */
    async waitForLoadState(
        state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle',
    ) {
        await this.page.waitForLoadState(state);
    }

    /**
     * Ожидание появления элемента
     */
    async waitForElement(selector: string, timeout?: number) {
        await this.page.waitForSelector(selector, { timeout });
    }

    /**
     * Ожидание исчезновения элемента
     */
    async waitForElementHidden(selector: string, timeout?: number) {
        await this.page.waitForSelector(selector, { state: 'hidden', timeout });
    }

    /**
     * Проверка наличия элемента на странице
     */
    async isElementVisible(selector: string): Promise<boolean> {
        try {
            const element = this.page.locator(selector);
            await element.waitFor({ state: 'visible', timeout: 1000 });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Получение текста элемента
     */
    async getText(selector: string): Promise<string> {
        return (await this.page.locator(selector).textContent()) || '';
    }

    /**
     * Клик по элементу
     */
    async click(selector: string) {
        await this.page.locator(selector).click();
    }

    /**
     * Ввод текста в поле
     */
    async fill(selector: string, text: string) {
        await this.page.locator(selector).fill(text);
    }

    /**
     * Проверка URL страницы
     */
    async expectUrl(url: string | RegExp) {
        await expect(this.page).toHaveURL(url);
    }

    /**
     * Проверка заголовка страницы
     */
    async expectTitle(title: string | RegExp) {
        await expect(this.page).toHaveTitle(title);
    }

    /**
     * Ожидание навигации
     */
    async waitForNavigation() {
        await this.page.waitForURL('**', { waitUntil: 'networkidle' });
    }

    /**
     * Получение текущего URL
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Скролл к элементу
     */
    async scrollTo(selector: string) {
        await this.page.locator(selector).scrollIntoViewIfNeeded();
    }

    /**
     * Ожидание загрузки (исчезновение loading индикатора)
     */
    async waitForLoading(timeout: number = 5000) {
        try {
            // Ожидаем исчезновение любых loading индикаторов
            await this.page.waitForSelector(
                '[data-testid="loading"], .loading, [aria-busy="true"]',
                {
                    state: 'hidden',
                    timeout,
                },
            );
        } catch {
            // Если нет loading индикаторов, просто ждем немного
            await this.page.waitForTimeout(500);
        }
    }
}
