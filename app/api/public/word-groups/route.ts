import { NextRequest, NextResponse } from 'next/server';
import { fetchPublicWordGroups } from '@/lib/public-word-groups';

/**
 * GET /api/public/word-groups?languageCode=
 * Public read-only list of approved public word groups.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const languageCode = searchParams.get('languageCode');

        const groups = await fetchPublicWordGroups(languageCode);

        return NextResponse.json(groups);
    } catch (error) {
        console.error('Error fetching public word groups:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
