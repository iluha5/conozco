import { getStaticResources } from './getStaticResources';

type TranslationParams = Record<string, string | number>;

// Sync `t()` when the language is already known (client helpers, metadata, etc.).
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
