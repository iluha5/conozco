export type LangParts = {
    language: string;
    region?: string;
};

/** Normalize BCP-47 tags (en_US, en-AU) for comparison. */
export function normalizeLangTag(tag: string): string {
    return tag.trim().replace(/_/g, '-').toLowerCase();
}

export function parseLangTag(tag: string): LangParts {
    const normalized = normalizeLangTag(tag);
    const [language, region] = normalized.split('-');

    return {
        language: language ?? normalized,
        region,
    };
}

export function langTagsMatch(a: string, b: string): boolean {
    return normalizeLangTag(a) === normalizeLangTag(b);
}

export function langRegionsMatch(
    voiceLang: string,
    requestedLang: string,
): boolean {
    const voice = parseLangTag(voiceLang);
    const requested = parseLangTag(requestedLang);

    return (
        voice.language === requested.language &&
        !!requested.region &&
        voice.region === requested.region
    );
}

export function langLanguagesMatch(
    voiceLang: string,
    requestedLang: string,
): boolean {
    return (
        parseLangTag(voiceLang).language ===
        parseLangTag(requestedLang).language
    );
}
