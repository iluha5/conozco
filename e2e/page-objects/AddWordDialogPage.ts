import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS } from '../utils/constants';

/**
 * Page Object for the add-word dialog
 */
export class AddWordDialogPage extends BasePage {
    // Selectors
    private readonly dialogTitle = 'text=Add word from dictionary';
    private readonly searchInput =
        'input[placeholder*="Search"], input[type="text"]';
    private readonly wordCard = '[role="dialog"] [class*="Card"]'; // Card component inside the dialog
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
     * Wait for the dialog to open
     */
    async expectDialogOpen() {
        await expect(this.page.locator(this.dialogTitle)).toBeVisible({
            timeout: TIMEOUTS.ELEMENT,
        });
    }

    /**
     * Search for a word in the dialog
     */
    async searchWord(searchTerm: string) {
        // Clear search field before typing
        const input = this.page.locator(this.searchInput).first();
        await input.clear();
        await input.fill(searchTerm);

        // Wait for debounce (400ms) + API results
        // Also wait for results to appear in the UI
        await this.page.waitForTimeout(500); // Debounce

        // Wait for loading to finish (skeleton disappears or results appear)
        try {
            // Wait for either words to appear or loading skeleton to disappear
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
            // If timed out, wait a bit longer
            await this.page.waitForTimeout(1000);
        }

        await this.waitForLoading();
    }

    /**
     * Select a word by text
     */
    async selectWord(wordText: string) {
        // Find word card by text inside the dialog
        const dialog = this.page.locator('[role="dialog"]');

        // First ensure the word text is visible
        const wordTextElement = dialog.locator(`text=/^${wordText}$/i`).first();
        await expect(wordTextElement).toBeVisible({ timeout: TIMEOUTS.API });

        // Click word text — should toggle the card (Card has onClick={onToggle})
        await wordTextElement.click();

        await this.waitForLoading();
    }

    /**
     * Assert a word is present in the list
     */
    async expectWordInList(wordText: string) {
        // Broad search inside the dialog
        // Word may be in CardTitle or card body text
        const dialog = this.page.locator('[role="dialog"]');
        const wordCard = dialog.locator(`text=${wordText}`).first();
        await expect(wordCard).toBeVisible({ timeout: TIMEOUTS.API });
    }

    /**
     * Click a word translation to open the translation picker dialog
     */
    async clickWordTranslation(wordText: string) {
        // Find word card
        const wordCard = this.page
            .locator('[role="dialog"]')
            .locator(`[class*="Card"]:has-text("${wordText}")`)
            .first();
        // Find clickable translation element (usually span or div)
        const translationLink = wordCard.locator(
            'span.cursor-pointer, div.cursor-pointer, span[class*="text-blue"]',
        );
        await translationLink.first().click();
        await this.waitForElement(this.translationDialog, TIMEOUTS.ELEMENT);
    }

    /**
     * Select a translation from the list (by index)
     */
    async selectTranslation(index: number = 0) {
        const translationOptions = this.page.locator(
            '[role="radiogroup"] input[type="radio"]',
        );
        await translationOptions.nth(index).click();
    }

    /**
     * Enter a custom translation
     */
    async enterCustomTranslation(translation: string) {
        await this.fill(this.customTranslationInput, translation);
    }

    /**
     * Save translation
     */
    async saveTranslation() {
        await this.click(this.saveTranslationButton);
        await this.waitForLoading();
    }

    /**
     * Add selected words
     */
    async addSelectedWords() {
        // More specific selector for the add-selected button
        // Button is in BulkActions or at the bottom of the dialog
        // Look for "Add all" or "Add words" in the dialog
        const dialog = this.page.locator('[role="dialog"]');
        const addSelectedButton = dialog
            .locator('button:has-text("Add all"), button:has-text("Add words")')
            .first();
        await addSelectedButton.click();
        await this.waitForLoading();
    }

    /**
     * Close the dialog
     */
    async closeDialog() {
        // Try close button or cancel
        const closeBtn = this.page.locator(this.closeButton);
        if (await closeBtn.isVisible()) {
            await closeBtn.click();
        } else {
            await this.click(this.cancelButton);
        }
        await this.waitForElementHidden(this.dialogTitle, TIMEOUTS.ELEMENT);
    }

    /**
     * Assert selected word count
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
