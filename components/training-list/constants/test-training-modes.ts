import { I18n } from '@/lib/i18n';

/**
 * @deprecated Используйте хук useTestModes вместо этой функции
 * Эта функция оставлена для обратной совместимости с getTrainingModeConfig
 */
export const getTestTrainingModes = (
    t: I18n['t'],
    languageCode?: string | null,
): [] => {
    // Возвращаем пустой массив, так как тесты теперь загружаются через useTestModes
    // Это нужно для обратной совместимости с getTrainingModeConfig
    return [];
};
