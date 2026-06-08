import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS, SELECTORS } from '../utils/constants';

/**
 * Page Object for the registration page
 */
export class RegisterPage extends BasePage {
    // Selectors
    private readonly emailInput = 'input[type="email"]';
    private readonly nameInput = 'input[type="text"]';
    private readonly passwordInputs = 'input[type="password"]';
    private readonly submitButton = 'button[type="submit"]';
    private readonly loginLink = 'a[href="/auth/login"]';
    private readonly cardTitle = 'h3:has-text("Registration")'; // More specific selector

    constructor(page: Page) {
        super(page);
    }

    /**
     * Navigate to the registration page
     */
    async goto() {
        await super.goto('/auth/register');
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
        const emailField = this.page.locator(this.emailInput).first();
        await emailField.fill(email);
    }

    /**
     * Enter name
     */
    async enterName(name: string) {
        await this.fill(this.nameInput, name);
    }

    /**
     * Enter password (first field)
     */
    async enterPassword(password: string) {
        const passwordFields = this.page.locator(this.passwordInputs);
        await passwordFields.first().fill(password);
    }

    /**
     * Enter admin password (second field)
     */
    async enterAdminPassword(adminPassword: string) {
        const passwordFields = this.page.locator(this.passwordInputs);
        await passwordFields.nth(1).fill(adminPassword);
    }

    /**
     * Click the form submit button
     */
    async clickSubmit() {
        await this.click(this.submitButton);
    }

    /**
     * Perform registration
     */
    async register(
        email: string,
        password: string,
        adminPassword: string,
        name?: string,
    ) {
        await this.enterEmail(email);
        if (name) {
            await this.enterName(name);
        }
        await this.enterPassword(password);
        await this.enterAdminPassword(adminPassword);
        // Wait for redirect to login (success) or stay on register page (error)
        await Promise.all([
            this.page.waitForURL(/\/auth\/(login|register)/, {
                timeout: 5000,
            }),
            this.clickSubmit(),
        ]);
    }

    /**
     * Click the login link
     */
    async clickLoginLink() {
        await this.click(this.loginLink);
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
     * Assert successful registration (redirect to login page)
     */
    async expectSuccessfulRegistration() {
        await this.expectUrl('/auth/login');
    }
}
