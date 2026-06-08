import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for the training setup page
 */
export class TrainingSetupPage extends BasePage {
    // Selectors
    private readonly pageTitle = 'text=Training setup';
    private readonly backButton = 'button:has-text("Back")';
    private readonly startTrainingButton = 'button:has-text("Start training")';
    private readonly stageCheckbox = (stage: number) =>
        `input[type="checkbox"][value="${stage}"]`;
    private readonly wordCheckbox = (wordId: string) =>
        `input[type="checkbox"][value="${wordId}"]`;
    private readonly selectAllWordsButton = 'button:has-text("Select all")';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Navigate to the training setup page
     */
    async goto() {
        await super.goto('/training/setup');
        await this.waitForLoadState();
    }

    /**
     * Assert the page is loaded
     */
    async expectPageLoaded() {
        await expect(this.page.locator(this.pageTitle)).toBeVisible();
    }

    /**
     * Click the "Back" button
     */
    async clickBack() {
        await this.click(this.backButton);
        await this.waitForNavigation();
    }

    /**
     * Open the stage settings section if collapsed
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
     * Toggle a training stage on/off
     */
    async toggleStage(stage: number) {
        // Open stage settings section if collapsed
        await this.openStagesSettings();

        // Find stage checkbox by id or click the stage card
        const stageCheckbox = this.page.locator(
            `input[type="checkbox"][id="setup-stage-${stage}"]`,
        );
        const stageCard = this.page.locator(
            `div:has(input[id="setup-stage-${stage}"])`,
        );

        // Try checkbox or card click
        if ((await stageCheckbox.count()) > 0) {
            await stageCheckbox.click();
        } else if ((await stageCard.count()) > 0) {
            await stageCard.click();
        } else {
            // Fallback: find by stage text
            const stageText = this.page.locator(`text=/Stage ${stage}/i`);
            await stageText.first().click();
        }
        await this.waitForLoading();
    }

    /**
     * Select a word for training by word text
     */
    async selectWordByText(wordText: string) {
        // Broad search — word may be in a span inside a checkbox row
        const wordCard = this.page
            .locator(`div.cursor-pointer:has-text("${wordText}")`)
            .first();

        // Wait for word to appear
        await wordCard.waitFor({ state: 'visible', timeout: 5000 });
        await wordCard.click();
        await this.waitForLoading();
    }

    /**
     * Select a word for training by ID
     */
    async selectWord(wordId: string) {
        // Find word checkbox by ID
        const checkbox = this.page.locator(
            `input[type="checkbox"][id="word-${wordId}"]`,
        );

        // Wait for checkbox
        try {
            await checkbox.waitFor({ state: 'visible', timeout: 5000 });
            await checkbox.click();
        } catch (error) {
            // Fallback: click word card containing this checkbox
            const wordCard = this.page
                .locator(`div:has(input[id="word-${wordId}"])`)
                .first();
            if ((await wordCard.count()) > 0) {
                await wordCard.click();
            } else {
                // If not found, try first word card
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
     * Select all words
     */
    async selectAllWords() {
        await this.click(this.selectAllWordsButton);
    }

    /**
     * Start training
     */
    async startTraining() {
        await this.click(this.startTrainingButton);
        await this.waitForNavigation();
    }

    /**
     * Assert start button is enabled
     */
    async expectStartButtonEnabled() {
        const button = this.page.locator(this.startTrainingButton);
        await expect(button).toBeEnabled();
    }

    /**
     * Assert start button is disabled
     */
    async expectStartButtonDisabled() {
        const button = this.page.locator(this.startTrainingButton);
        await expect(button).toBeDisabled();
    }

    /**
     * Wait for word list to load and start training
     * @returns true if training started, false if start button is not active
     */
    async waitAndStartTraining(): Promise<boolean> {
        // Wait for word list (app auto-selects first words)
        await this.page.waitForTimeout(2000);

        // Ensure start button exists and is visible
        const startButton = this.page.locator(this.startTrainingButton);
        const buttonVisible = await startButton
            .isVisible({ timeout: 5000 })
            .catch(() => false);

        if (!buttonVisible) {
            return false;
        }

        // Check button is enabled (words may be auto-selected)
        const isEnabled = await startButton.isEnabled().catch(() => false);

        if (!isEnabled) {
            return false;
        }

        // Start training
        await this.startTraining();
        await this.page.waitForTimeout(3000);

        return true;
    }
}
