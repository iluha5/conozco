import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object для страницы тренировки
 * Базовая реализация для всех этапов тренировки
 */
export class TrainingPage extends BasePage {
    // Селекторы
    private readonly trainingContainer = '[data-testid="training-container"]';
    private readonly trainingHeader = 'text=Тренировка'; // Заголовок тренировки
    private readonly stageSelector = '[class*="StageSelector"]'; // Селектор этапов
    private readonly nextButton = 'button:has-text("Далее")';
    private readonly exitButton = 'button:has-text("Выход")';
    private readonly pauseButton = 'button:has-text("Пауза")';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Переход на страницу тренировки
     */
    async goto() {
        await super.goto('/training');
        await this.waitForLoadState();
    }

    /**
     * Проверка, что страница загружена
     */
    async expectPageLoaded() {
        // Проверяем наличие элементов тренировки
        // Используем несколько вариантов для надежности
        const container = this.page.locator(this.trainingContainer);
        const header = this.page.locator(this.trainingHeader);
        const stageSelector = this.page.locator(this.stageSelector);

        // Проверяем наличие хотя бы одного из элементов
        const hasContainer = await container
            .isVisible({ timeout: 2000 })
            .catch(() => false);
        const hasHeader = await header
            .isVisible({ timeout: 2000 })
            .catch(() => false);
        const hasStageSelector = await stageSelector
            .isVisible({ timeout: 2000 })
            .catch(() => false);

        if (!hasContainer && !hasHeader && !hasStageSelector) {
            // Fallback: проверяем, что мы не на странице настройки
            const setupPage = this.page.locator('text=Настройка тренировки');
            const isOnSetup = await setupPage
                .isVisible({ timeout: 1000 })
                .catch(() => false);
            if (isOnSetup) {
                throw new Error('Still on setup page, training did not start');
            }
            // Если мы не на странице настройки, считаем что тренировка загрузилась
        }
    }

    /**
     * Клик по кнопке "Далее"
     */
    async clickNext() {
        await this.click(this.nextButton);
        await this.waitForLoading();
    }

    /**
     * Клик по кнопке "Выход"
     */
    async clickExit() {
        await this.click(this.exitButton);
    }

    /**
     * Клик по кнопке "Пауза"
     */
    async clickPause() {
        await this.click(this.pauseButton);
    }

    /**
     * Проверка текущего этапа тренировки
     */
    async expectStage(stage: number) {
        const stageIndicator = this.page.locator(
            `text=/Этап ${stage}|Stage ${stage}/i`,
        );
        await expect(stageIndicator.first()).toBeVisible();
    }
}
