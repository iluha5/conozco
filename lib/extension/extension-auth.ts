import 'server-only';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    hashExtensionToken,
    isExtensionTokenExpired,
} from '@/lib/extension/extension-tokens';

export type ExtensionAuthContext = {
    userId: number;
    tokenId: number;
};

function parseBearerToken(request: NextRequest): string | null {
    const authorization = request.headers.get('authorization');

    if (!authorization?.startsWith('Bearer ')) {
        return null;
    }

    const token = authorization.slice('Bearer '.length).trim();

    return token.length > 0 ? token : null;
}

/**
 * Authenticates Chrome extension requests via Bearer token.
 * Updates lastUsedAt on success.
 */
export async function getExtensionAuth(
    request: NextRequest,
): Promise<ExtensionAuthContext | null> {
    const rawToken = parseBearerToken(request);

    if (!rawToken) {
        return null;
    }

    const tokenHash = hashExtensionToken(rawToken);

    const extensionToken = await prisma.extensionToken.findUnique({
        where: { tokenHash },
        select: {
            id: true,
            userId: true,
            expiresAt: true,
            revokedAt: true,
        },
    });

    if (!extensionToken || extensionToken.revokedAt) {
        return null;
    }

    if (isExtensionTokenExpired(extensionToken.expiresAt)) {
        return null;
    }

    await prisma.extensionToken.update({
        where: { id: extensionToken.id },
        data: { lastUsedAt: new Date() },
    });

    return {
        userId: extensionToken.userId,
        tokenId: extensionToken.id,
    };
}

export function unauthorizedExtensionResponse() {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
