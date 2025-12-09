import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TIMEOUTS, SELECTORS } from '../utils/constants';

/**
 * Page Object для Header компонента
 * Используется на всех страницах после авторизации
 */
export class HeaderPage extends BasePage {
    // Селекторы
    private readonly logo = 'a:has-text("Flash Cards")';
    private readonly logoutButton = 'button:has-text("Выйти")';
    private readonly userEmail =
        '[data-test="header-wrapper"] span:has-text("@")';
    private readonly trainingLink =
        'a[href="/training/setup"]:has-text("Тренировка")';
    private readonly wordsLink = 'a[href="/words"]:has-text("Слова")';
    private readonly wordGroupsLink =
        'a[href="/word-groups"]:has-text("Группы слов")';
    private readonly settingsLink = 'a[href="/settings"]:has-text("Настройки")';
    private readonly mobileMenuButton = 'button[aria-label="menu"]';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Проверка, что Header виден
     */
    async expectHeaderVisible() {
        await expect(this.page.locator(SELECTORS.HEADER)).toBeVisible();
    }

    /**
     * Клик по логотипу (переход на главную)
     */
    async clickLogo() {
        await this.click(this.logo);
        await this.waitForLoadState();
    }

    /**
     * Выход из системы
     */
    async logout() {
        // Пробуем сначала desktop версию
        const desktopLogout = this.page.locator(this.logoutButton);
        if (await desktopLogout.isVisible()) {
            // Кликаем по кнопке выхода и ждем редирект
            await desktopLogout.click();
            // Ждем редирект на страницу логина после выхода (signOut использует callbackUrl)
            await this.page.waitForURL(/\/auth\/login/, {
                timeout: TIMEOUTS.NAVIGATION,
            });
        } else {
            // Если desktop не виден, открываем mobile меню
            await this.openMobileMenu();
            const mobileLogout = this.page.locator('button:has-text("Выйти")');
            // Кликаем по кнопке выхода и ждем редирект
            await mobileLogout.click();
            // Ждем редирект на страницу логина после выхода (signOut использует callbackUrl)
            await this.page.waitForURL(/\/auth\/login/, {
                timeout: TIMEOUTS.NAVIGATION,
            });
        }
    }

    /**
     * Открытие мобильного меню
     */
    async openMobileMenu() {
        if (await this.page.locator(this.mobileMenuButton).isVisible()) {
            await this.click(this.mobileMenuButton);
        }
    }

    /**
     * Переход на страницу тренировки
     */
    async goToTraining() {
        await this.click(this.trainingLink);
        await this.waitForLoadState();
    }

    /**
     * Переход на страницу слов
     */
    async goToWords() {
        await this.click(this.wordsLink);
        await this.waitForLoadState();
    }

    /**
     * Переход на страницу групп слов
     */
    async goToWordGroups() {
        await this.click(this.wordGroupsLink);
        await this.waitForLoadState();
    }

    /**
     * Переход на страницу настроек
     */
    async goToSettings() {
        await this.click(this.settingsLink);
        await this.waitForLoadState();
    }

    /**
     * Проверка email пользователя в Header
     */
    async expectUserEmail(email: string) {
        await expect(this.page.locator(this.userEmail)).toContainText(email);
    }

    /**
     * Проверка роли Admin
     */
    async expectAdminRole() {
        const adminBadge = this.page.locator('text=Admin');
        await expect(adminBadge).toBeVisible();
    }
}
