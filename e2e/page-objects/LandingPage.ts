import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the public landing page
 */
export class LandingPage extends BasePage {
    private readonly pageTitle = 'h1:has-text("Learn words with Conozco")';
    private readonly brandLink = 'a:has-text("conozco")';

    constructor(page: Page) {
        super(page);
    }

    async goto() {
        await super.goto('/');
        await this.waitForLoadState();
    }

    async expectPageLoaded() {
        await expect(this.page.locator(this.pageTitle)).toBeVisible();
        await expect(this.page.locator(this.brandLink)).toBeVisible();
    }
}
