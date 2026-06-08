import { Page, expect } from '@playwright/test';
import { TIMEOUTS, SELECTORS } from '../utils/constants';

/**
 * Base class for all Page Objects
 * Contains common navigation and wait helpers
 */
export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigate to a page
     */
    async goto(path: string = '') {
        await this.page.goto(path);
    }

    /**
     * Wait for page load state
     */
    async waitForLoadState(
        state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle',
    ) {
        await this.page.waitForLoadState(state);
    }

    /**
     * Wait for an element to appear
     */
    async waitForElement(selector: string, timeout: number = TIMEOUTS.ELEMENT) {
        await this.page.waitForSelector(selector, { timeout });
    }

    /**
     * Wait for an element to disappear
     */
    async waitForElementHidden(
        selector: string,
        timeout: number = TIMEOUTS.ELEMENT,
    ) {
        await this.page.waitForSelector(selector, { state: 'hidden', timeout });
    }

    /**
     * Check whether an element is visible on the page
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
     * Get element text content
     */
    async getText(selector: string): Promise<string> {
        return (await this.page.locator(selector).textContent()) || '';
    }

    /**
     * Click an element
     */
    async click(selector: string) {
        await this.page.locator(selector).click();
    }

    /**
     * Fill a text input
     */
    async fill(selector: string, text: string) {
        await this.page.locator(selector).fill(text);
    }

    /**
     * Assert page URL
     */
    async expectUrl(url: string | RegExp) {
        await expect(this.page).toHaveURL(url);
    }

    /**
     * Assert page title
     */
    async expectTitle(title: string | RegExp) {
        await expect(this.page).toHaveTitle(title);
    }

    /**
     * Wait for navigation to complete
     */
    async waitForNavigation() {
        await this.page.waitForURL('**', { waitUntil: 'networkidle' });
    }

    /**
     * Get current URL
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Scroll to an element
     */
    async scrollTo(selector: string) {
        await this.page.locator(selector).scrollIntoViewIfNeeded();
    }

    /**
     * Wait for loading to finish (loading indicator disappears)
     */
    async waitForLoading(timeout: number = TIMEOUTS.ELEMENT) {
        try {
            // Wait for any loading indicators to disappear
            await this.page.waitForSelector(SELECTORS.LOADING, {
                state: 'hidden',
                timeout,
            });
        } catch {
            // If no loading indicators, just wait a bit
            await this.page.waitForTimeout(500);
        }
    }

    /**
     * Fill a form (sequential input into multiple fields)
     */
    async fillForm(fields: Array<{ selector: string; value: string }>) {
        for (const field of fields) {
            await this.fill(field.selector, field.value);
        }
    }

    /**
     * Wait for a toast message to appear
     */
    async waitForToast(timeout: number = TIMEOUTS.TOAST) {
        await this.page.waitForSelector(SELECTORS.TOAST_ERROR, {
            timeout,
            state: 'visible',
        });
    }
}
