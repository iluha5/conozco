import type { ExtensionToken } from '@prisma/client';

export type ExtensionTokenListItem = {
    id: number;
    name: string;
    tokenPrefix: string;
    createdAt: string;
    lastUsedAt: string | null;
    expiresAt: string | null;
    revokedAt: string | null;
    isActive: boolean;
};

export function serializeExtensionTokenListItem(
    token: ExtensionToken,
): ExtensionTokenListItem {
    const isActive = !token.revokedAt;

    return {
        id: token.id,
        name: token.name,
        tokenPrefix: token.tokenPrefix,
        createdAt: token.createdAt.toISOString(),
        lastUsedAt: token.lastUsedAt?.toISOString() ?? null,
        expiresAt: token.expiresAt?.toISOString() ?? null,
        revokedAt: token.revokedAt?.toISOString() ?? null,
        isActive,
    };
}
