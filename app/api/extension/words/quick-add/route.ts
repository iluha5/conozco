import { NextRequest, NextResponse } from 'next/server';
import {
    getExtensionAuth,
    unauthorizedExtensionResponse,
} from '@/lib/extension/extension-auth';
import { quickAddWordForExtensionUser } from '@/lib/extension/quick-add';

/**
 * POST /api/extension/words/quick-add
 * Adds a word or phrase to the user's vocabulary (Bearer token).
 */
export async function POST(request: NextRequest) {
    try {
        const auth = await getExtensionAuth(request);

        if (!auth) {
            return unauthorizedExtensionResponse();
        }

        const body = await request.json();
        const rawWord = typeof body.word === 'string' ? body.word : '';

        const result = await quickAddWordForExtensionUser(auth.userId, rawWord);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: result.error,
                    ...(result.retryAfter !== undefined
                        ? { retryAfter: result.retryAfter }
                        : {}),
                },
                { status: result.status },
            );
        }

        const statusCode = result.data.createdInDictionary ? 201 : 200;

        return NextResponse.json(result.data, { status: statusCode });
    } catch (error) {
        console.error('Error in extension quick-add:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
