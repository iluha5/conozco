export type DictionaryMembership = 'en' | 'es' | 'both' | 'neither';

export type InputLanguageDecision =
    | { kind: 'forward' }
    | { kind: 'reverse' }
    | { kind: 'unknown' }
    | { kind: 'reject'; reason: 'mixed-script' | 'outside-pair' };

const CYRILLIC = /[\u0400-\u04FF]/;
const LATIN_LETTER = /[A-Za-z\u00C0-\u024F\u1E00-\u1EFF]/;
const SPANISH_MARK = /[ñ¿¡]/i;

type DecideInputLanguageParams = {
    text: string;
    learnLanguage: string;
    ownLanguage: string | null;
    membership: (_token: string) => DictionaryMembership;
};

export function decideInputLanguage({
    text,
    learnLanguage,
    ownLanguage,
    membership,
}: DecideInputLanguageParams): InputLanguageDecision {
    const hasCyrillic = CYRILLIC.test(text);
    const hasLatin = LATIN_LETTER.test(text);

    if (hasCyrillic && hasLatin) {
        return { kind: 'reject', reason: 'mixed-script' };
    }

    if (hasCyrillic) {
        if (ownLanguage === 'ru') return { kind: 'reverse' };
        if (learnLanguage === 'ru') return { kind: 'forward' };
        return { kind: 'reject', reason: 'outside-pair' };
    }

    if (!ownLanguage || ownLanguage === learnLanguage || !hasLatin) {
        return { kind: 'forward' };
    }

    const comparesEnglishAndSpanish =
        (learnLanguage === 'en' && ownLanguage === 'es') ||
        (learnLanguage === 'es' && ownLanguage === 'en');

    if (!comparesEnglishAndSpanish) {
        return { kind: 'forward' };
    }

    if (SPANISH_MARK.test(text)) {
        return learnLanguage === 'es'
            ? { kind: 'forward' }
            : { kind: 'reverse' };
    }

    const voted = voteLatinTokens(text, membership);
    if (voted === 'en' || voted === 'es') {
        return voted === learnLanguage
            ? { kind: 'forward' }
            : { kind: 'reverse' };
    }
    if (voted === 'neither') return { kind: 'unknown' };
    return { kind: 'forward' };
}

export function directionAfterDeepLDetect(input: {
    detectedLanguage: string | null;
    sourceEqualsTarget: boolean;
    learnLanguage: string;
    ownLanguage: string;
}): 'forward' | 'reverse' {
    if (
        input.sourceEqualsTarget ||
        input.detectedLanguage === input.ownLanguage
    ) {
        return 'reverse';
    }
    return 'forward';
}

export function normalizeLearnWord(raw: string): string {
    const withoutTrailingPunctuation = raw.trim().replace(/[,.;:!?]+$/g, '');
    const firstOption = withoutTrailingPunctuation.split(/[,;]/)[0] ?? '';
    return firstOption
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 5)
        .join(' ');
}

function voteLatinTokens(
    text: string,
    membership: (_token: string) => DictionaryMembership,
): 'en' | 'es' | 'both' | 'neither' | 'tie' {
    const tokens = text
        .toLowerCase()
        .split(/[^a-zñáéíóúü]+/)
        .filter(Boolean);

    if (tokens.length === 0) return 'neither';

    let englishVotes = 0;
    let spanishVotes = 0;
    let unknownTokens = 0;

    for (const token of tokens) {
        const tokenMembership = membership(token);
        if (tokenMembership === 'en') englishVotes += 1;
        else if (tokenMembership === 'es') spanishVotes += 1;
        else if (tokenMembership === 'neither') unknownTokens += 1;
    }

    if (englishVotes > spanishVotes) return 'en';
    if (spanishVotes > englishVotes) return 'es';
    if (englishVotes === 0 && spanishVotes === 0) {
        return unknownTokens > 0 ? 'neither' : 'both';
    }
    return 'tie';
}
