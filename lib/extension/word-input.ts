export const EXTENSION_MAX_WORD_LENGTH = 100;

export function normalizeExtensionWordInput(rawWord: string): string {
    return rawWord.trim().toLowerCase();
}

export function validateExtensionWordInput(rawWord: string): {
    valid: boolean;
    error?: string;
    normalizedWord?: string;
} {
    const trimmed = rawWord.trim();

    if (!trimmed) {
        return { valid: false, error: 'Word cannot be empty' };
    }

    if (trimmed.includes('\n') || trimmed.includes('\r')) {
        return {
            valid: false,
            error: 'Word or phrase must be on a single line',
        };
    }

    if (trimmed.length > EXTENSION_MAX_WORD_LENGTH) {
        return {
            valid: false,
            error: `Word or phrase must be at most ${EXTENSION_MAX_WORD_LENGTH} characters`,
        };
    }

    return {
        valid: true,
        normalizedWord: normalizeExtensionWordInput(rawWord),
    };
}
