import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    getExtensionAuth,
    unauthorizedExtensionResponse,
} from '@/lib/extension/extension-auth';

/**
 * GET /api/extension/me
 * Returns profile info for the authenticated extension (Bearer token).
 */
export async function GET(request: NextRequest) {
    try {
        const auth = await getExtensionAuth(request);

        if (!auth) {
            return unauthorizedExtensionResponse();
        }

        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            select: {
                id: true,
                email: true,
                name: true,
                hasConfigured: true,
                ownLanguage: {
                    select: { id: true, code: true, name: true },
                },
                learnLanguage: {
                    select: { id: true, code: true, name: true },
                },
                interfaceLanguage: {
                    select: { id: true, code: true, name: true },
                },
            },
        });

        if (!user) {
            return unauthorizedExtensionResponse();
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching extension profile:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
