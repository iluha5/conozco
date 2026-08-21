import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS, SELECTORS } from '../utils/constants';

/**
 * Page Object for the Header component
 * Visible for both guest and authenticated users on pages that render Header
 */
export class HeaderPage extends BasePage {
    private readonly logo = 'a:has-text("conozco")';
    private readonly logoutButton = 'button:has-text("Logout")';
    private readonly signOutButton = 'button:has-text("Sign out")';
    private readonly userEmail =
        '[data-test="header-wrapper"] span:has-text("@")';
    private readonly trainingLink =
        'a[href="/training/list"]:has-text("Training")';
    private readonly wordsLink = 'a[href="/words"]:has-text("Words")';
    private readonly wordGroupsLink =
        'a[href="/word-groups"]:has-text("Word groups")';
    private readonly settingsLink = 'a[href="/settings"]:has-text("Settings")';
    private readonly mobileMenuButton = 'header .lg\\:hidden button';

    constructor(page: Page) {
        super(page);
    }

    private get headerWrapper() {
        return this.page.locator(SELECTORS.HEADER);
    }

    async expectHeaderVisible() {
        await expect(this.headerWrapper).toBeVisible();
    }

    async expectGuestState() {
        await this.expectHeaderVisible();
        await expect(
            this.headerWrapper.getByRole('button', { name: 'Login' }),
        ).toBeVisible();
        await expect(
            this.headerWrapper.getByRole('button', { name: 'Register' }),
        ).toBeVisible();
        await expect(this.page.locator(this.logoutButton)).not.toBeVisible();
        await expect(this.page.locator(this.userEmail)).not.toBeVisible();
    }

    async expectAuthenticatedState(email?: string) {
        await this.expectHeaderVisible();
        await expect(
            this.headerWrapper.getByRole('button', { name: 'Logout' }),
        ).toBeVisible({ timeout: TIMEOUTS.SESSION_SETUP });
        if (email) {
            await this.expectUserEmail(email);
        }
        await expect(
            this.headerWrapper.getByRole('button', { name: 'Login' }),
        ).not.toBeVisible();
    }

    async clickLogo() {
        await this.click(this.logo);
        await this.waitForLoadState();
    }

    async logout() {
        const desktopLogout = this.headerWrapper.getByRole('button', {
            name: 'Logout',
        });
        if (await desktopLogout.isVisible()) {
            await desktopLogout.click();
            await expect(this.page).toHaveURL(/\/auth\/login/, {
                timeout: TIMEOUTS.NAVIGATION,
            });
            return;
        }

        await this.openMobileMenu();
        await this.page.locator(this.signOutButton).click();
        await expect(this.page).toHaveURL(/\/auth\/login/, {
            timeout: TIMEOUTS.NAVIGATION,
        });
    }

    async openMobileMenu() {
        const mobileMenu = this.page.locator(this.mobileMenuButton);
        if (await mobileMenu.isVisible()) {
            await mobileMenu.click();
        }
    }

    async goToTraining() {
        await this.click(this.trainingLink);
        await this.waitForLoadState();
    }

    async goToWords() {
        await this.click(this.wordsLink);
        await this.waitForLoadState();
    }

    async goToWordGroups() {
        await this.click(this.wordGroupsLink);
        await this.waitForLoadState();
    }

    async goToSettings() {
        await this.click(this.settingsLink);
        await this.waitForLoadState();
    }

    async expectUserEmail(email: string) {
        await expect(this.page.locator(this.userEmail)).toContainText(email);
    }

    async expectAdminRole() {
        const adminBadge = this.page.locator('text=Admin');
        await expect(adminBadge).toBeVisible();
    }
}
