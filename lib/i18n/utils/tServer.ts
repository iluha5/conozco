import 'server-only';

import { getUserInterfaceLanguage } from './getUserInterfaceLanguage';
import { tServerSync } from './tServerSync';

type TranslationParams = Record<string, string | number>;

// Server-side `t()` for server components / actions; resolves the user's UI language from DB unless explicitly passed.
export async function tServer(
    key: string,
    params?: TranslationParams,
    lang?: string,
): Promise<string> {
    const targetLang = lang || (await getUserInterfaceLanguage()) || 'en';
    return tServerSync(key, targetLang, params);
}
