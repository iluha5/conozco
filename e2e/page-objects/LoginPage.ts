import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS, SELECTORS } from '../utils/constants';

/**
 * Page Object for the login page
 */
export class LoginPage extends BasePage {
    // Selectors
    private readonly emailInput = 'input[type="email"]';
    private readonly passwordInput = 'input[type="password"]';
    private readonly submitButton = 'button[type="submit"]';
    private readonly registerLink = 'a[href="/auth/register"]';
    private readonly cardTitle = 'h3:has-text("Login")'; // More specific selector

    constructor(page: Page) {
        super(page);
    }

    /**
     * Navigate to the login page
     */
    async goto() {
        await super.goto('/auth/login');
        await this.waitForLoadState();
    }

    /**
     * Assert the page is loaded
     */
    async expectPageLoaded() {
        await expect(this.page.locator(this.cardTitle)).toBeVisible();
    }

    /**
     * Enter email
     */
    async enterEmail(email: string) {
        await this.fill(this.emailInput, email);
    }

    /**
     * Enter password
     */
    async enterPassword(password: string) {
        await this.fill(this.passwordInput, password);
    }

    /**
     * Click the form submit button
     */
    async clickSubmit() {
        await this.click(this.submitButton);
    }

    /**
     * Perform login
     */
    async login(email: string, password: string) {
        await this.enterEmail(email);
        await this.enterPassword(password);

        // Click submit
        await this.clickSubmit();

        // Wait for form handling (redirect or error)
        // Do not wait for a specific URL here — outcome depends on result
        await this.page.waitForLoadState('networkidle', { timeout: 5000 });
    }

    /**
     * Click the registration link
     */
    async clickRegisterLink() {
        await this.click(this.registerLink);
        await this.waitForLoadState();
    }

    /**
     * Assert an error is shown
     * Looks for the error in the toast description, not the title
     */
    async expectError(message?: string) {
        // Find error toast
        // Toast may appear in different places — use a broad search
        const errorText = this.page.locator(SELECTORS.TOAST_ERROR);

        // Wait for error toast (may appear with a delay)
        await expect(errorText.first()).toBeVisible({
            timeout: TIMEOUTS.TOAST,
        });

        if (message) {
            // Assert error text in toast
            await expect(errorText.first()).toContainText(message, {
                ignoreCase: true,
            });
        }
    }

    /**
     * Assert successful login (redirect to training list)
     */
    async expectSuccessfulLogin() {
        await this.expectUrl('/training/list');
    }
}
