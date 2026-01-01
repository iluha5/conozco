import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../utils/constants';

/**
 * Page Object для диалога добавления слов
 */
export class AddWordDialogPage extends BasePage {
    // Селекторы
    private readonly dialogTitle = 'text=Add word from dictionary';
    private readonly searchInput =
        'input[placeholder*="Search"], input[type="text"]';
    private readonly wordCard = '[role="dialog"] [class*="Card"]'; // Card компонент в диалоге
    private readonly addButton = 'button:has-text("Add")';
    private readonly cancelButton = 'button:has-text("Cancel")';
    private readonly closeButton =
        'button[aria-label="Close"], button:has([aria-label*="close" i])';
    private readonly translationDialog =
        '[role="dialog"]:has-text("Select translation option")';
    private readonly customTranslationInput =
        'input[placeholder*="Enter translation text"], input[type="text"]';
    private readonly saveTranslationButton = 'button:has-text("Save")';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Ожидание открытия диалога
     */
    async expectDialogOpen() {
        await expect(this.page.locator(this.dialogTitle)).toBeVisible({
            timeout: TIMEOUTS.ELEMENT,
        });
    }

    /**
     * Поиск слова в диалоге
     */
    async searchWord(searchTerm: string) {
        // Очищаем поле поиска перед вводом
        const input = this.page.locator(this.searchInput).first();
        await input.clear();
        await input.fill(searchTerm);

        // Ждем debounce (400мс) + загрузку результатов через API
        // Также ждем появления результатов в UI
        await this.page.waitForTimeout(500); // Debounce

        // Ждем завершения загрузки (исчезновение skeleton или появление результатов)
        try {
            // Ждем либо появления слов, либо skeleton загрузки
            await Promise.race([
                this.page.waitForSelector(
                    '[class*="Card"]:has-text("' + searchTerm + '")',
                    {
                        timeout: TIMEOUTS.API,
                    },
                ),
                this.page.waitForSelector('[class*="Skeleton"]', {
                    state: 'hidden',
                    timeout: TIMEOUTS.API,
                }),
            ]);
        } catch {
            // Если не дождались, просто ждем еще немного
            await this.page.waitForTimeout(1000);
        }

        await this.waitForLoading();
    }

    /**
     * Выбор слова по тексту
     */
    async selectWord(wordText: string) {
        // Ищем карточку слова по тексту в диалоге
        const dialog = this.page.locator('[role="dialog"]');

        // Сначала проверяем, что слово видно (текст слова)
        const wordTextElement = dialog.locator(`text=/^${wordText}$/i`).first();
        await expect(wordTextElement).toBeVisible({ timeout: TIMEOUTS.API });

        // Кликаем по тексту слова - это должно выбрать карточку
        // так как Card имеет onClick={onToggle}
        await wordTextElement.click();

        await this.waitForLoading();
    }

    /**
     * Проверка наличия слова в списке
     */
    async expectWordInList(wordText: string) {
        // Ищем слово в диалоге - используем более широкий поиск
        // Слово может быть в CardTitle или в тексте карточки
        // Ищем в диалоге текст слова (может быть в разных местах)
        const dialog = this.page.locator('[role="dialog"]');
        const wordCard = dialog.locator(`text=${wordText}`).first();
        await expect(wordCard).toBeVisible({ timeout: TIMEOUTS.API });
    }

    /**
     * Клик по переводу слова для открытия диалога выбора перевода
     */
    async clickWordTranslation(wordText: string) {
        // Ищем карточку слова
        const wordCard = this.page
            .locator('[role="dialog"]')
            .locator(`[class*="Card"]:has-text("${wordText}")`)
            .first();
        // Ищем кликабельный элемент с переводом (обычно это span или div с текстом перевода)
        const translationLink = wordCard.locator(
            'span.cursor-pointer, div.cursor-pointer, span[class*="text-blue"]',
        );
        await translationLink.first().click();
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
     * Добавление выбранных слов
     */
    async addSelectedWords() {
        // Используем более специфичный селектор для кнопки добавления выбранных слов
        // Кнопка находится в BulkActions компоненте или внизу диалога
        // Ищем кнопку "Добавить все" или "Добавить выбранные" в диалоге
        const dialog = this.page.locator('[role="dialog"]');
        const addSelectedButton = dialog
            .locator(
                'button:has-text("Add all"), button:has-text("Add words")',
            )
            .first();
        await addSelectedButton.click();
        await this.waitForLoading();
    }

    /**
     * Закрытие диалога
     */
    async closeDialog() {
        // Пробуем закрыть через кнопку закрытия или отмены
        const closeBtn = this.page.locator(this.closeButton);
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        } else {
            await this.click(this.cancelButton);
        }
        await this.waitForElementHidden(this.dialogTitle, TIMEOUTS.ELEMENT);
    }

    /**
     * Проверка количества выбранных слов
     */
    async expectSelectedWordsCount(count: number) {
        const selectedBadge = this.page.locator(
            `text=/selected.*${count}|${count}.*selected/i`,
        );
        await expect(selectedBadge.first()).toBeVisible({
            timeout: TIMEOUTS.ELEMENT,
        });
    }
}
