import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object для главной страницы
 */
export class HomePage extends BasePage {
    // Селекторы
    private readonly pageTitle = 'h1:has-text("Flash Cards")';
    private readonly startTrainingButton =
        'button:has-text("Начать тренировку")';
    private readonly goToWordsButton = 'button:has-text("Перейти к словам")';
    private readonly continueTrainingCard = '[data-testid="continue-training"]';
    private readonly trainingModeButton = 'button:has-text("Выбрать режим")';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Переход на главную страницу
     */
    async goto() {
        await super.goto('/');
        await this.waitForLoadState();
    }

    /**
     * Проверка, что страница загружена
     */
    async expectPageLoaded() {
        await expect(this.page.locator(this.pageTitle)).toBeVisible();
    }

    /**
     * Клик по кнопке "Начать тренировку"
     */
    async clickStartTraining() {
        await this.click(this.startTrainingButton);
        await this.waitForNavigation();
    }

    /**
     * Клик по кнопке "Перейти к словам"
     */
    async clickGoToWords() {
        await this.click(this.goToWordsButton);
        await this.waitForNavigation();
    }

    /**
     * Клик по кнопке "Выбрать режим"
     */
    async clickTrainingMode() {
        await this.click(this.trainingModeButton);
        await this.waitForNavigation();
    }

    /**
     * Продолжить незавершенную тренировку
     */
    async continueTraining() {
        if (await this.isElementVisible(this.continueTrainingCard)) {
            const continueButton = this.page.locator(
                `${this.continueTrainingCard} button:has-text("Продолжить")`,
            );
            await continueButton.click();
            await this.waitForNavigation();
        }
    }

    /**
     * Проверка наличия карточки продолжения тренировки
     */
    async expectContinueTrainingCard() {
        await expect(
            this.page.locator(this.continueTrainingCard),
        ).toBeVisible();
    }

    /**
     * Проверка отсутствия карточки продолжения тренировки
     */
    async expectNoContinueTrainingCard() {
        const card = this.page.locator(this.continueTrainingCard);
        await expect(card)
            .not.toBeVisible()
            .catch(() => {
                // Если элемент не найден, это тоже нормально
            });
    }
}
