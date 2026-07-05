import {
    EXTENSION_TOKEN_TTL_DAYS,
    generateExtensionToken,
    getExtensionTokenExpiresAt,
    getExtensionTokenPrefix,
    hashExtensionToken,
    isExtensionTokenExpired,
} from '@/lib/extension/extension-tokens';

describe('extension-tokens', () => {
    describe('generateExtensionToken', () => {
        it('generates unique tokens with sufficient length', () => {
            const tokenA = generateExtensionToken();
            const tokenB = generateExtensionToken();

            expect(tokenA).not.toBe(tokenB);
            expect(tokenA.length).toBeGreaterThan(20);
        });
    });

    describe('hashExtensionToken', () => {
        it('returns stable sha256 hex hash', () => {
            const token = 'test-token-value';
            const hashA = hashExtensionToken(token);
            const hashB = hashExtensionToken(token);

            expect(hashA).toBe(hashB);
            expect(hashA).toMatch(/^[a-f0-9]{64}$/);
        });

        it('produces different hashes for different tokens', () => {
            expect(hashExtensionToken('token-a')).not.toBe(
                hashExtensionToken('token-b'),
            );
        });
    });

    describe('getExtensionTokenPrefix', () => {
        it('returns first 8 characters', () => {
            expect(getExtensionTokenPrefix('abcdefgh1234')).toBe('abcdefgh');
        });
    });

    describe('getExtensionTokenExpiresAt', () => {
        it('returns date in the future', () => {
            const expiresAt = getExtensionTokenExpiresAt();

            expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
        });

        it('uses custom ttl days', () => {
            const now = Date.now();
            const expiresAt = getExtensionTokenExpiresAt(7);
            const expectedMs = 7 * 24 * 60 * 60 * 1000;

            expect(expiresAt.getTime() - now).toBeGreaterThanOrEqual(
                expectedMs - 1000,
            );
            expect(expiresAt.getTime() - now).toBeLessThanOrEqual(
                expectedMs + 1000,
            );
        });
    });

    describe('isExtensionTokenExpired', () => {
        it('returns false when expiresAt is null', () => {
            expect(isExtensionTokenExpired(null)).toBe(false);
        });

        it('returns true for past date', () => {
            const pastDate = new Date(Date.now() - 1000);
            expect(isExtensionTokenExpired(pastDate)).toBe(true);
        });

        it('returns false for future date', () => {
            const futureDate = new Date(
                Date.now() + EXTENSION_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
            );
            expect(isExtensionTokenExpired(futureDate)).toBe(false);
        });
    });
});
