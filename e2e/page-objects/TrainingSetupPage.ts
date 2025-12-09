import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object для страницы настройки тренировки
 */
export class TrainingSetupPage extends BasePage {
    // Селекторы
    private readonly pageTitle = 'text=Настройка тренировки';
    private readonly backButton = 'button:has-text("Назад")';
    private readonly startTrainingButton =
        'button:has-text("Начать тренировку")';
    private readonly stageCheckbox = (stage: number) =>
        `input[type="checkbox"][value="${stage}"]`;
    private readonly wordCheckbox = (wordId: string) =>
        `input[type="checkbox"][value="${wordId}"]`;
    private readonly selectAllWordsButton = 'button:has-text("Выбрать все")';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Переход на страницу настройки тренировки
     */
    async goto() {
        await super.goto('/training/setup');
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
     * Включение/выключение этапа тренировки
     */
    async toggleStage(stage: number) {
        await this.click(this.stageCheckbox(stage));
    }

    /**
     * Выбор слова для тренировки
     */
    async selectWord(wordId: string) {
        await this.click(this.wordCheckbox(wordId));
    }

    /**
     * Выбор всех слов
     */
    async selectAllWords() {
        await this.click(this.selectAllWordsButton);
    }

    /**
     * Запуск тренировки
     */
    async startTraining() {
        await this.click(this.startTrainingButton);
        await this.waitForNavigation();
    }

    /**
     * Проверка, что кнопка запуска активна
     */
    async expectStartButtonEnabled() {
        const button = this.page.locator(this.startTrainingButton);
        await expect(button).toBeEnabled();
    }

    /**
     * Проверка, что кнопка запуска неактивна
     */
    async expectStartButtonDisabled() {
        const button = this.page.locator(this.startTrainingButton);
        await expect(button).toBeDisabled();
    }
}
