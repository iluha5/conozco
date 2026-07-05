import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { getIpAddress, getUserAgent } from '@/lib/ip-utils';
import { prisma } from '@/lib/prisma';
import { checkAndLogRateLimit } from '@/lib/rate-limit';
import {
    generateExtensionToken,
    getExtensionTokenExpiresAt,
    getExtensionTokenPrefix,
    hashExtensionToken,
} from '@/lib/extension/extension-tokens';
import { serializeExtensionTokenListItem } from '@/lib/extension/serializeExtensionToken';

const MAX_TOKEN_NAME_LENGTH = 100;
const MAX_ACTIVE_TOKENS_PER_USER = 5;

/**
 * POST /api/extension/auth/token
 * Creates a new extension API token (requires NextAuth session).
 * Returns the raw token once — it cannot be retrieved again.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User session expired. Please sign in again.' },
                { status: 401 },
            );
        }

        const ipAddress = getIpAddress(request);

        const rateLimit = await checkAndLogRateLimit({
            email: user.email,
            ipAddress: ipAddress || undefined,
            action: 'EXTENSION_AUTH_TOKEN',
            limitMinutes: 60,
            maxAttempts: 5,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many token creation attempts',
                    retryAfter: rateLimit.remainingSeconds,
                },
                { status: 429 },
            );
        }

        const activeTokenCount = await prisma.extensionToken.count({
            where: {
                userId,
                revokedAt: null,
            },
        });

        if (activeTokenCount >= MAX_ACTIVE_TOKENS_PER_USER) {
            return NextResponse.json(
                {
                    error: `Maximum of ${MAX_ACTIVE_TOKENS_PER_USER} active extension tokens reached. Revoke an existing token first.`,
                },
                { status: 409 },
            );
        }

        const body = await request.json().catch(() => ({}));
        const rawName = typeof body.name === 'string' ? body.name.trim() : '';
        const name =
            rawName.length > 0
                ? rawName.slice(0, MAX_TOKEN_NAME_LENGTH)
                : 'Chrome Extension';

        const rawToken = generateExtensionToken();
        const tokenHash = hashExtensionToken(rawToken);
        const tokenPrefix = getExtensionTokenPrefix(rawToken);
        const expiresAt = getExtensionTokenExpiresAt();

        const extensionToken = await prisma.extensionToken.create({
            data: {
                userId,
                tokenHash,
                tokenPrefix,
                name,
                expiresAt,
            },
        });

        await logAudit({
            userId,
            action: 'EXTENSION_TOKEN_CREATED',
            ipAddress: ipAddress || null,
            userAgent: getUserAgent(request),
            metadata: {
                tokenId: extensionToken.id,
                tokenPrefix,
                name,
            },
        });

        return NextResponse.json(
            {
                token: rawToken,
                tokenPrefix,
                item: serializeExtensionTokenListItem(extensionToken),
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('Error creating extension token:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/extension/auth/token
 * Revokes an extension token by id (requires NextAuth session).
 */
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);
        const body = await request.json();
        const tokenId = Number(body.tokenId);

        if (!Number.isInteger(tokenId) || tokenId <= 0) {
            return NextResponse.json(
                { error: 'Valid tokenId is required' },
                { status: 400 },
            );
        }

        const extensionToken = await prisma.extensionToken.findFirst({
            where: {
                id: tokenId,
                userId,
            },
        });

        if (!extensionToken) {
            return NextResponse.json(
                { error: 'Token not found' },
                { status: 404 },
            );
        }

        if (extensionToken.revokedAt) {
            return NextResponse.json(
                { error: 'Token is already revoked' },
                { status: 409 },
            );
        }

        const revokedToken = await prisma.extensionToken.update({
            where: { id: tokenId },
            data: { revokedAt: new Date() },
        });

        await logAudit({
            userId,
            action: 'EXTENSION_TOKEN_REVOKED',
            ipAddress: getIpAddress(request) || null,
            userAgent: getUserAgent(request),
            metadata: {
                tokenId,
            },
        });

        return NextResponse.json({
            success: true,
            item: serializeExtensionTokenListItem(revokedToken),
        });
    } catch (error) {
        console.error('Error revoking extension token:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
