import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS, SELECTORS } from '../utils/constants';

/**
 * Page Object for the Header component
 * Used on all pages after authentication
 */
export class HeaderPage extends BasePage {
    // Selectors
    private readonly logo = 'a:has-text("Flash Cards")';
    private readonly logoutButton = 'button:has-text("Logout")';
    private readonly userEmail =
        '[data-test="header-wrapper"] span:has-text("@")';
    private readonly trainingLink =
        'a[href="/training/setup"]:has-text("Training")';
    private readonly wordsLink = 'a[href="/words"]:has-text("Words")';
    private readonly wordGroupsLink =
        'a[href="/word-groups"]:has-text("Word groups")';
    private readonly settingsLink = 'a[href="/settings"]:has-text("Settings")';
    private readonly mobileMenuButton = 'button[aria-label="menu"]';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Assert the Header is visible
     */
    async expectHeaderVisible() {
        await expect(this.page.locator(SELECTORS.HEADER)).toBeVisible();
    }

    /**
     * Click the logo (navigate to home)
     */
    async clickLogo() {
        await this.click(this.logo);
        await this.waitForLoadState();
    }

    /**
     * Log out
     */
    async logout() {
        // Try desktop version first
        const desktopLogout = this.page.locator(this.logoutButton);
        if (await desktopLogout.isVisible()) {
            // Click logout button and wait for redirect
            await desktopLogout.click();
            // Wait for redirect to login page after logout (signOut uses callbackUrl)
            await this.page.waitForURL(/\/auth\/login/, {
                timeout: TIMEOUTS.NAVIGATION,
            });
        } else {
            // If desktop not visible, open mobile menu
            await this.openMobileMenu();
            const mobileLogout = this.page.locator('button:has-text("Logout")');
            // Click logout button and wait for redirect
            await mobileLogout.click();
            // Wait for redirect to login page after logout (signOut uses callbackUrl)
            await this.page.waitForURL(/\/auth\/login/, {
                timeout: TIMEOUTS.NAVIGATION,
            });
        }
    }

    /**
     * Open the mobile menu
     */
    async openMobileMenu() {
        if (await this.page.locator(this.mobileMenuButton).isVisible()) {
            await this.click(this.mobileMenuButton);
        }
    }

    /**
     * Navigate to the training page
     */
    async goToTraining() {
        await this.click(this.trainingLink);
        await this.waitForLoadState();
    }

    /**
     * Navigate to the words page
     */
    async goToWords() {
        await this.click(this.wordsLink);
        await this.waitForLoadState();
    }

    /**
     * Navigate to the word groups page
     */
    async goToWordGroups() {
        await this.click(this.wordGroupsLink);
        await this.waitForLoadState();
    }

    /**
     * Navigate to the settings page
     */
    async goToSettings() {
        await this.click(this.settingsLink);
        await this.waitForLoadState();
    }

    /**
     * Assert user email is shown in the Header
     */
    async expectUserEmail(email: string) {
        await expect(this.page.locator(this.userEmail)).toContainText(email);
    }

    /**
     * Assert Admin role badge is visible
     */
    async expectAdminRole() {
        const adminBadge = this.page.locator('text=Admin');
        await expect(adminBadge).toBeVisible();
    }
}
