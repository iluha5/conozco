import { getStaticResources } from './getStaticResources';
import { getUserInterfaceLanguage } from './getUserInterfaceLanguage';

type TranslationParams = Record<string, string | number>;

// Server-side `t()` for server components / actions; resolves the user's UI language from DB unless explicitly passed.
export async function tServer(
    key: string,
    params?: TranslationParams,
    lang?: string,
): Promise<string> {
    const resources = getStaticResources();
    const targetLang = lang || (await getUserInterfaceLanguage()) || 'en';

    const langResource = resources[targetLang as keyof typeof resources] as
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

// Sync variant when the language is already known (e.g. from props/context).
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
