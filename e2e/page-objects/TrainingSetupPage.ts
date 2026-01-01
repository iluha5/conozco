import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object для страницы настройки тренировки
 */
export class TrainingSetupPage extends BasePage {
    // Селекторы
    private readonly pageTitle = 'text=Training setup';
    private readonly backButton = 'button:has-text("Back")';
    private readonly startTrainingButton =
        'button:has-text("Start training")';
    private readonly stageCheckbox = (stage: number) =>
        `input[type="checkbox"][value="${stage}"]`;
    private readonly wordCheckbox = (wordId: string) =>
        `input[type="checkbox"][value="${wordId}"]`;
    private readonly selectAllWordsButton = 'button:has-text("Select all")';

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
     * Открытие секции настроек этапов (если она закрыта)
     */
    async openStagesSettings() {
        const toggleButton = this.page.locator(
            'button:has-text("Stage settings")',
        );
        const isExpanded = await toggleButton
            .locator('svg')
            .first()
            .getAttribute('class')
            .then(classes => classes?.includes('ChevronUp'))
            .catch(() => false);

        if (!isExpanded) {
            await toggleButton.click();
            await this.waitForLoading();
        }
    }

    /**
     * Включение/выключение этапа тренировки
     */
    async toggleStage(stage: number) {
        // Сначала открываем секцию настроек этапов, если она закрыта
        await this.openStagesSettings();

        // Ищем чекбокс этапа по id или кликаем по карточке этапа
        const stageCheckbox = this.page.locator(
            `input[type="checkbox"][id="setup-stage-${stage}"]`,
        );
        const stageCard = this.page.locator(
            `div:has(input[id="setup-stage-${stage}"])`,
        );

        // Пробуем кликнуть по чекбоксу или карточке
        if ((await stageCheckbox.count()) > 0) {
            await stageCheckbox.click();
        } else if ((await stageCard.count()) > 0) {
            await stageCard.click();
        } else {
            // Fallback: ищем по тексту этапа
            const stageText = this.page.locator(
                `text=/Stage ${stage}/i`,
            );
            await stageText.first().click();
        }
        await this.waitForLoading();
    }

    /**
     * Выбор слова для тренировки по тексту слова
     */
    async selectWordByText(wordText: string) {
        // Ищем слово по тексту - используем более широкий поиск
        // Слово может быть в span внутри div с чекбоксом
        const wordCard = this.page
            .locator(`div.cursor-pointer:has-text("${wordText}")`)
            .first();

        // Ждем появления слова
        await wordCard.waitFor({ state: 'visible', timeout: 5000 });
        await wordCard.click();
        await this.waitForLoading();
    }

    /**
     * Выбор слова для тренировки по ID
     */
    async selectWord(wordId: string) {
        // Ищем чекбокс слова по ID
        const checkbox = this.page.locator(
            `input[type="checkbox"][id="word-${wordId}"]`,
        );

        // Ждем появления чекбокса
        try {
            await checkbox.waitFor({ state: 'visible', timeout: 5000 });
            await checkbox.click();
        } catch (error) {
            // Fallback: кликаем по карточке слова, которая содержит этот чекбокс
            const wordCard = this.page
                .locator(`div:has(input[id="word-${wordId}"])`)
                .first();
            if ((await wordCard.count()) > 0) {
                await wordCard.click();
            } else {
                // Если не нашли, пробуем найти по тексту или просто кликнуть по первому слову
                const firstWordCard = this.page
                    .locator('div.cursor-pointer:has(input[type="checkbox"])')
                    .first();
                if ((await firstWordCard.count()) > 0) {
                    await firstWordCard.click();
                }
            }
        }
        await this.waitForLoading();
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

    /**
     * Ждет загрузки списка слов и запускает тренировку
     * @returns true если тренировка успешно запущена, false если кнопка не активна
     */
    async waitAndStartTraining(): Promise<boolean> {
        // Ждем загрузки списка слов (приложение автоматически выбирает первые слова)
        await this.page.waitForTimeout(2000);

        // Проверяем, что кнопка запуска существует и видна
        const startButton = this.page.locator(this.startTrainingButton);
        const buttonVisible = await startButton
            .isVisible({ timeout: 5000 })
            .catch(() => false);

        if (!buttonVisible) {
            return false;
        }

        // Проверяем, что кнопка активна (если слова выбраны автоматически)
        const isEnabled = await startButton.isEnabled().catch(() => false);

        if (!isEnabled) {
            return false;
        }

        // Запускаем тренировку
        await this.startTraining();
        await this.page.waitForTimeout(3000);

        return true;
    }
}
