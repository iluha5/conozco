import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object для страницы настроек
 */
export class SettingsPage extends BasePage {
    // Селекторы
    private readonly pageTitle = 'h1:has-text("Settings")';
    private readonly backButton = 'button:has-text("Back")';
    private readonly saveButton = 'button:has-text("Save")';
    private readonly nameInput = 'input[id="name"]';
    private readonly ownLanguageSelect = 'button:has-text("Native language")';
    private readonly learnLanguageSelect = 'button:has-text("Language to learn")';
    private readonly interfaceLanguageSelect =
        'button:has-text("Interface language")';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Переход на страницу настроек
     */
    async goto() {
        await super.goto('/settings');
        await this.waitForLoadState();
    }

    /**
     * Проверка, что страница загружена
     */
    async expectPageLoaded() {
        await expect(this.page.locator(this.pageTitle)).toBeVisible();
    }

    /**
     * Клик по кнопке "Назад"
     */
    async clickBack() {
        await this.click(this.backButton);
        await this.waitForNavigation();
    }

    /**
     * Ввод имени
     */
    async enterName(name: string) {
        await this.fill(this.nameInput, name);
    }

    /**
     * Выбор родного языка
     */
    async selectOwnLanguage(languageName: string) {
        await this.click(this.ownLanguageSelect);
        await this.page.locator(`text="${languageName}"`).click();
    }

    /**
     * Выбор изучаемого языка
     */
    async selectLearnLanguage(languageName: string) {
        await this.click(this.learnLanguageSelect);
        await this.page.locator(`text="${languageName}"`).click();
    }

    /**
     * Выбор языка интерфейса
     */
    async selectInterfaceLanguage(languageName: string) {
        await this.click(this.interfaceLanguageSelect);
        await this.page.locator(`text="${languageName}"`).click();
    }

    /**
     * Сохранение настроек
     */
    async saveSettings() {
        await this.click(this.saveButton);
        await this.waitForLoading();
    }

    /**
     * Проверка успешного сохранения
     */
    async expectSettingsSaved() {
        const successMessage = this.page.locator(
            'text=/Settings saved|successfully updated/i',
        );
        await expect(successMessage.first()).toBeVisible();
    }
}
