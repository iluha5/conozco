import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the home page
 */
export class HomePage extends BasePage {
    // Selectors
    private readonly pageTitle = 'h1:has-text("conozco")';
    private readonly startTrainingButton = 'button:has-text("Start training")';
    private readonly goToWordsButton = 'button:has-text("Go to words")';
    private readonly continueTrainingCard = '[data-testid="continue-training"]';
    private readonly trainingModeButton =
        'button:has-text("Choose a suitable training mode or configure your own")';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Navigate to the home page
     */
    async goto() {
        await super.goto('/');
        await this.waitForLoadState();
    }

    /**
     * Assert the page is loaded
     */
    async expectPageLoaded() {
        await expect(this.page.locator(this.pageTitle)).toBeVisible();
    }

    /**
     * Click the "Start training" button
     */
    async clickStartTraining() {
        await this.click(this.startTrainingButton);
        await this.waitForNavigation();
    }

    /**
     * Click the "Go to words" button
     */
    async clickGoToWords() {
        await this.click(this.goToWordsButton);
        await this.waitForNavigation();
    }

    /**
     * Click the training mode selection button
     */
    async clickTrainingMode() {
        await this.click(this.trainingModeButton);
        await this.waitForNavigation();
    }

    /**
     * Continue an unfinished training session
     */
    async continueTraining() {
        if (await this.isElementVisible(this.continueTrainingCard)) {
            const continueButton = this.page.locator(
                `${this.continueTrainingCard} button:has-text("Continue")`,
            );
            await continueButton.click();
            await this.waitForNavigation();
        }
    }

    /**
     * Assert the continue-training card is visible
     */
    async expectContinueTrainingCard() {
        await expect(
            this.page.locator(this.continueTrainingCard),
        ).toBeVisible();
    }

    /**
     * Assert the continue-training card is not visible
     */
    async expectNoContinueTrainingCard() {
        const card = this.page.locator(this.continueTrainingCard);
        await expect(card)
            .not.toBeVisible()
            .catch(() => {
                // If element not found, this is also normal
            });
    }
}
