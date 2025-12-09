import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object для страницы управления словами
 */
export class WordsPage extends BasePage {
    // Селекторы
    private readonly pageTitle = 'h1:has-text("Мои слова")';
    private readonly addWordButton = 'button:has-text("Добавить слово")';
    private readonly backButton = 'button:has-text("Назад")';
    private readonly statusFilterAll = 'text=Всего слов';
    private readonly statusFilterNotLearned = 'text=Не выучено';
    private readonly statusFilterLearned = 'text=Выучено';
    private readonly wordsList = '[data-testid="words-list"]';
    private readonly wordItem = '[data-testid="word-item"]';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Переход на страницу слов
     */
    async goto() {
        await super.goto('/words');
        await this.waitForLoadState();
    }

    /**
     * Проверка, что страница загружена
     */
    async expectPageLoaded() {
        await expect(this.page.locator(this.pageTitle)).toBeVisible();
    }

    /**
     * Клик по кнопке "Добавить слово"
     */
    async clickAddWord() {
        await this.click(this.addWordButton);
    }

    /**
     * Клик по кнопке "Назад"
     */
    async clickBack() {
        await this.click(this.backButton);
        await this.waitForNavigation();
    }

    /**
     * Выбор фильтра по статусу
     */
    async selectStatusFilter(status: 'ALL' | 'NOT_LEARNED' | 'LEARNED') {
        switch (status) {
            case 'ALL':
                await this.click(this.statusFilterAll);
                break;
            case 'NOT_LEARNED':
                await this.click(this.statusFilterNotLearned);
                break;
            case 'LEARNED':
                await this.click(this.statusFilterLearned);
                break;
        }
        await this.waitForLoading();
    }

    /**
     * Получение количества слов в списке
     */
    async getWordsCount(): Promise<number> {
        const words = this.page.locator(this.wordItem);
        return await words.count();
    }

    /**
     * Проверка наличия слова в списке
     */
    async expectWordInList(wordText: string) {
        const wordElement = this.page.locator(
            `${this.wordItem}:has-text("${wordText}")`,
        );
        await expect(wordElement).toBeVisible();
    }

    /**
     * Выбор слова по тексту
     */
    async selectWord(wordText: string) {
        const wordElement = this.page.locator(
            `${this.wordItem}:has-text("${wordText}")`,
        );
        await wordElement.click();
    }

    /**
     * Проверка пустого состояния
     */
    async expectEmptyState() {
        const emptyMessage = this.page.locator(
            'text=/Слова не найдены|Добавьте новое слово/i',
        );
        await expect(emptyMessage).toBeVisible();
    }
}
