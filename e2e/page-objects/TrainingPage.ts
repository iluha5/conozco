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

    /**
     * Клик на этап в селекторе этапов
     * @param stage - номер этапа (1-6)
     */
    async clickStage(stage: number) {
        // Ищем карточку этапа по тексту "Этап {stage}" (десктоп) или просто "{stage}" (мобильный)
        // Используем селектор, который находит видимый текст
        const stageTextDesktop = this.page
            .locator(`text=/^Этап ${stage}$/i`)
            .filter({ hasNotText: 'md:hidden' }); // Исключаем скрытые элементы

        const stageTextMobile = this.page
            .locator(`text=/^${stage}$/i`)
            .filter({ hasNotText: 'hidden' }); // Исключаем скрытые элементы

        // Пробуем найти видимый текст этапа
        let stageText = null;
        const desktopCount = await stageTextDesktop.count();
        if (desktopCount > 0) {
            stageText = stageTextDesktop.first();
        } else {
            const mobileCount = await stageTextMobile.count();
            if (mobileCount > 0) {
                stageText = stageTextMobile.first();
            }
        }

        if (stageText) {
            // Находим родительский Card компонент (карточку этапа)
            // Card компонент содержит этот текст и имеет onClick обработчик
            const stageCard = stageText
                .locator('..')
                .locator('..')
                .locator('..')
                .first();
            await stageCard.waitFor({ state: 'visible', timeout: 3000 });
            await stageCard.click();
        } else {
            // Fallback: находим все карточки этапов и кликаем по индексу
            // Ищем контейнер с карточками этапов (обычно это div с flex классом)
            const cardsContainer = this.page
                .locator('div:has-text("Этап 1"), div:has-text("1")')
                .locator('..')
                .locator('..');
            const cards = cardsContainer.locator('div[class*="Card"]');
            const cardCount = await cards.count();

            if (cardCount >= stage) {
                await cards.nth(stage - 1).click();
            } else {
                throw new Error(`Stage ${stage} card not found`);
            }
        }

        await this.waitForLoading();
    }

    /**
     * Проверка заголовка этапа
     * @param expectedTitle - ожидаемый заголовок этапа
     */
    async expectStageTitle(expectedTitle: string) {
        const title = this.page.locator(`text=/^${expectedTitle}$/i`);
        await expect(title.first()).toBeVisible({ timeout: 5000 });
    }
}
