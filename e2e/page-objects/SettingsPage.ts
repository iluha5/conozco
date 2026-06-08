import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the settings page
 */
export class SettingsPage extends BasePage {
    // Selectors
    private readonly pageTitle = 'h1:has-text("Settings")';
    private readonly backButton = 'button:has-text("Back")';
    private readonly saveButton = 'button:has-text("Save")';
    private readonly nameInput = 'input[id="name"]';
    private readonly ownLanguageSelect = 'button:has-text("Native language")';
    private readonly learnLanguageSelect =
        'button:has-text("Language to learn")';
    private readonly interfaceLanguageSelect =
        'button:has-text("Interface language")';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Navigate to the settings page
     */
    async goto() {
        await super.goto('/settings');
        await this.waitForLoadState();
    }

    /**
     * Assert the page is loaded
     */
    async expectPageLoaded() {
        await expect(this.page.locator(this.pageTitle)).toBeVisible();
    }

    /**
     * Click the "Back" button
     */
    async clickBack() {
        await this.click(this.backButton);
        await this.waitForNavigation();
    }

    /**
     * Enter name
     */
    async enterName(name: string) {
        await this.fill(this.nameInput, name);
    }

    /**
     * Select native language
     */
    async selectOwnLanguage(languageName: string) {
        await this.click(this.ownLanguageSelect);
        await this.page.locator(`text="${languageName}"`).click();
    }

    /**
     * Select language to learn
     */
    async selectLearnLanguage(languageName: string) {
        await this.click(this.learnLanguageSelect);
        await this.page.locator(`text="${languageName}"`).click();
    }

    /**
     * Select interface language
     */
    async selectInterfaceLanguage(languageName: string) {
        await this.click(this.interfaceLanguageSelect);
        await this.page.locator(`text="${languageName}"`).click();
    }

    /**
     * Save settings
     */
    async saveSettings() {
        await this.click(this.saveButton);
        await this.waitForLoading();
    }

    /**
     * Assert settings were saved successfully
     */
    async expectSettingsSaved() {
        const successMessage = this.page.locator(
            'text=/Settings saved|successfully updated/i',
        );
        await expect(successMessage.first()).toBeVisible();
    }
}
