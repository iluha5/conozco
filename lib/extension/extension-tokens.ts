import { createHash, randomBytes } from 'crypto';

/** Default token lifetime: 90 days */
export const EXTENSION_TOKEN_TTL_DAYS = 90;

/** Prefix shown in token list (first 8 chars of raw token) */
export const EXTENSION_TOKEN_PREFIX_LENGTH = 8;

export function generateExtensionToken(): string {
    return randomBytes(32).toString('base64url');
}

export function hashExtensionToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

export function getExtensionTokenPrefix(token: string): string {
    return token.slice(0, EXTENSION_TOKEN_PREFIX_LENGTH);
}

export function getExtensionTokenExpiresAt(
    ttlDays: number = EXTENSION_TOKEN_TTL_DAYS,
): Date {
    return new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
}

export function isExtensionTokenExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) {
        return false;
    }

    return expiresAt.getTime() <= Date.now();
}
