import { TrainingModeGroupId } from '../types/typing';
import { getTabsConfig } from '../constants/tabs-config';
import { I18n } from '@/lib/i18n';

/**
 * Получить ID таба из хеша URL
 */
export function getTabFromHash(
    hash: string,
    t: I18n['t'],
): TrainingModeGroupId | null {
    const normalizedHash = hash.startsWith('#') ? hash.slice(1) : hash;

    const tabsConfig = getTabsConfig(t);
    const tabConfig = tabsConfig.find(config => config.hash === normalizedHash);

    if (tabConfig) {
        return tabConfig.id;
    }

    // Если хеш пустой или не найден, возвращаем первый таб (new) по умолчанию
    if (!normalizedHash) {
        return 'new';
    }

    return null;
}

/**
 * Получить хеш для таба
 */
export function getHashFromTab(
    tab: TrainingModeGroupId,
    t: I18n['t'],
): string | null {
    const tabsConfig = getTabsConfig(t);
    const tabConfig = tabsConfig.find(config => config.id === tab);

    if (!tabConfig) {
        return null;
    }

    return tabConfig.hash || null;
}

/**
 * Обновить хеш в URL для указанного таба
 */
export function updateUrlHash(tab: TrainingModeGroupId, t: I18n['t']): void {
    const hash = getHashFromTab(tab, t);
    const currentHash = window.location.hash.slice(1);

    if (!hash) {
        return;
    }

    // Обновляем хеш только если он отличается от текущего
    if (currentHash !== hash) {
        window.history.pushState(null, '', `#${hash}`);
    }
}
