import { getStaticResources } from './getStaticResources';
import { getUserInterfaceLanguage } from './getUserInterfaceLanguage';

type TranslationParams = Record<string, string | number>;

/**
 * Серверная функция для получения перевода
 * Работает без React Context, подходит для server components и server actions
 *
 * @param key - ключ перевода
 * @param params - параметры для интерполяции (опционально)
 * @param lang - язык (опционально, если не указан - определяется из БД)
 * @returns переведенная строка
 */
export async function tServer(
    key: string,
    params?: TranslationParams,
    lang?: string,
): Promise<string> {
    const resources = getStaticResources();
    const targetLang = lang || (await getUserInterfaceLanguage()) || 'en';

    // Получаем перевод из ресурсов
    const langResource = resources[targetLang as keyof typeof resources] as
        | { glob?: Record<string, string> }
        | undefined;
    const enResource = resources['en'] as
        | { glob?: Record<string, string> }
        | undefined;

    const translation =
        langResource?.glob?.[key] || enResource?.glob?.[key] || key;

    // Интерполяция параметров
    if (params && typeof translation === 'string') {
        return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey]?.toString() || match;
        });
    }

    return translation as string;
}

/**
 * Синхронная версия для случаев, когда язык уже известен
 * Используется когда язык передается явно (например, из props или контекста)
 *
 * @param key - ключ перевода
 * @param lang - язык (по умолчанию 'en')
 * @param params - параметры для интерполяции (опционально)
 * @returns переведенная строка
 */
export function tServerSync(
    key: string,
    lang: string = 'en',
    params?: TranslationParams,
): string {
    const resources = getStaticResources();

    const langResource = resources[lang as keyof typeof resources] as
        | { glob?: Record<string, string> }
        | undefined;
    const enResource = resources['en'] as
        | { glob?: Record<string, string> }
        | undefined;

    const translation =
        langResource?.glob?.[key] || enResource?.glob?.[key] || key;

    if (params && typeof translation === 'string') {
        return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
            return params[paramKey]?.toString() || match;
        });
    }

    return translation as string;
}
