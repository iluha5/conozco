import { TrainingModeGroupId } from '../types/typing';
import { TABS_CONFIG } from '../constants/tabs-config';

/**
 * Получить ID таба из хеша URL
 */
export function getTabFromHash(hash: string): TrainingModeGroupId | null {
    const normalizedHash = hash.startsWith('#') ? hash.slice(1) : hash;

    const tabConfig = TABS_CONFIG.find(
        config => config.hash === normalizedHash,
    );

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
export function getHashFromTab(tab: TrainingModeGroupId): string | null {
    const tabConfig = TABS_CONFIG.find(config => config.id === tab);

    if (!tabConfig) {
        return null;
    }

    return tabConfig.hash || null;
}

/**
 * Обновить хеш в URL для указанного таба
 */
export function updateUrlHash(tab: TrainingModeGroupId): void {
    const hash = getHashFromTab(tab);
    const currentHash = window.location.hash.slice(1);

    if (!hash) {
        return;
    }

    // Обновляем хеш только если он отличается от текущего
    if (currentHash !== hash) {
        window.history.pushState(null, '', `#${hash}`);
    }
}
