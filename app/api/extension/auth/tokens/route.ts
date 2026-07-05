import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeExtensionTokenListItem } from '@/lib/extension/serializeExtensionToken';

/**
 * GET /api/extension/auth/tokens
 * Lists extension tokens for the authenticated user (requires NextAuth session).
 * Raw tokens are never returned — only prefixes for identification.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);

        const tokens = await prisma.extensionToken.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            items: tokens.map(token => serializeExtensionTokenListItem(token)),
        });
    } catch (error) {
        console.error('Error listing extension tokens:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
