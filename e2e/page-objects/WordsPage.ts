import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../utils/constants';

/**
 * Page Object для страницы управления словами
 */
export class WordsPage extends BasePage {
    // Селекторы
    private readonly pageTitle = 'h1:has-text("My words")';
    private readonly addWordButton =
        'button:has-text("Add word"), button:has-text("Add")';
    private readonly backButton = 'button:has-text("Back")';
    private readonly statusFilterAll = 'text=Total words';
    private readonly statusFilterNotLearned = 'text=Not learned';
    private readonly statusFilterLearned = 'text=Learned';
    private readonly wordsList = '[data-testid="words-list"]';
    private readonly wordItem = '[data-testid="word-item"]';
    private readonly wordCard = '[data-testid="word-item"]';
    private readonly selectAllButton = 'button:has-text("Select all")';
    private readonly deleteButton = 'button:has-text("Delete")';
    private readonly markLearnedButton = 'button:has-text("Learned")';
    private readonly markNotLearnedButton = 'button:has-text("Not learned")';
    private readonly confirmDeleteButton =
        'button:has-text("Delete"):not(:has-text("word"))';
    private readonly confirmStatusButton = 'button:has-text("Confirm")';
    private readonly translationDialog =
        '[role="dialog"]:has-text("Select translation option")';
    private readonly customTranslationInput =
        'input[placeholder*="Enter translation text"]';
    private readonly saveTranslationButton = 'button:has-text("Save")';

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
            'text=/Words not found|Add a new word/i',
        );
        await expect(emptyMessage).toBeVisible();
    }

    /**
     * Выбор слова по тексту (клик по карточке)
     */
    async clickWord(wordText: string) {
        const wordElement = this.page.locator(
            `${this.wordCard}:has-text("${wordText}")`,
        );
        await wordElement.click();
    }

    /**
     * Клик по переводу слова для редактирования
     */
    async clickWordTranslation(wordText: string) {
        const wordCard = this.page.locator(
            `${this.wordCard}:has-text("${wordText}")`,
        );
        const translationLink = wordCard.locator('text=/translation/i');
        await translationLink.click();
        await this.waitForElement(this.translationDialog, TIMEOUTS.ELEMENT);
    }

    /**
     * Выбор перевода из списка (по индексу)
     */
    async selectTranslation(index: number = 0) {
        const translationOptions = this.page.locator(
            '[role="radiogroup"] input[type="radio"]',
        );
        await translationOptions.nth(index).click();
    }

    /**
     * Ввод кастомного перевода
     */
    async enterCustomTranslation(translation: string) {
        await this.fill(this.customTranslationInput, translation);
    }

    /**
     * Сохранение перевода
     */
    async saveTranslation() {
        await this.click(this.saveTranslationButton);
        await this.waitForLoading();
    }

    /**
     * Удаление слова (клик по кнопке удаления в карточке)
     */
    async deleteWord(wordText: string) {
        const wordCard = this.page.locator(
            `${this.wordCard}:has-text("${wordText}")`,
        );
        const deleteButton = wordCard.locator(
            'button[aria-label*="delete"], button:has-text("Delete")',
        );
        await deleteButton.click();
        await this.waitForLoading();
    }

    /**
     * Изменение статуса слова (клик по иконке статуса)
     */
    async toggleWordStatus(wordText: string) {
        const wordCard = this.page.locator(
            `${this.wordCard}:has-text("${wordText}")`,
        );
        const statusButton = wordCard.locator(
            'button[aria-label*="status"], button:has([data-testid*="status"])',
        );
        await statusButton.click();
        await this.waitForLoading();
    }

    /**
     * Выбор всех слов
     */
    async selectAllWords() {
        await this.click(this.selectAllButton);
        await this.waitForLoading();
    }

    /**
     * Массовое удаление выбранных слов
     */
    async bulkDelete() {
        await this.click(this.deleteButton);
        await this.waitForElement(this.confirmDeleteButton, TIMEOUTS.ELEMENT);
        await this.click(this.confirmDeleteButton);
        await this.waitForLoading();
    }

    /**
     * Массовое изменение статуса на "Выучено"
     */
    async bulkMarkAsLearned() {
        await this.click(this.markLearnedButton);
        await this.waitForElement(this.confirmStatusButton, TIMEOUTS.ELEMENT);
        await this.click(this.confirmStatusButton);
        await this.waitForLoading();
    }

    /**
     * Массовое изменение статуса на "Не выучено"
     */
    async bulkMarkAsNotLearned() {
        await this.click(this.markNotLearnedButton);
        await this.waitForElement(this.confirmStatusButton, TIMEOUTS.ELEMENT);
        await this.click(this.confirmStatusButton);
        await this.waitForLoading();
    }

    /**
     * Проверка статуса слова (выучено/не выучено)
     */
    async expectWordStatus(
        wordText: string,
        status: 'LEARNED' | 'NOT_LEARNED',
    ) {
        const wordCard = this.page.locator(
            `${this.wordCard}:has-text("${wordText}")`,
        );
        if (status === 'LEARNED') {
            const learnedIcon = wordCard.locator(
                '[data-testid*="learned"], .text-green-600',
            );
            await expect(learnedIcon.first()).toBeVisible();
        } else {
            const notLearnedIcon = wordCard.locator(
                '[data-testid*="not-learned"], .text-orange-600',
            );
            await expect(notLearnedIcon.first()).toBeVisible();
        }
    }

    /**
     * Проверка отсутствия слова в списке
     */
    async expectWordNotInList(wordText: string) {
        const wordElement = this.page.locator(
            `${this.wordCard}:has-text("${wordText}")`,
        );
        await expect(wordElement).not.toBeVisible();
    }
}
