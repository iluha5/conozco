import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWordData } from '@/lib/translation-api';
import {
    createBaseWordFromExternal,
    findBaseWordByExactMatch,
} from '@/lib/words/createBaseWordFromExternal';

/**
 * POST /api/ai-search
 * Searches for word via inner and external API
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
            include: {
                ownLanguage: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User session expired. Please sign in again.' },
                { status: 401 },
            );
        }

        const translationLanguageCode = user.ownLanguage?.code || 'en';

        const { word, languageCode } = await request.json();

        if (!word || !languageCode) {
            return NextResponse.json(
                { error: 'Word and language code are required' },
                { status: 400 },
            );
        }

        const trimmedWord = word.trim().toLowerCase();

        if (!trimmedWord) {
            return NextResponse.json(
                { error: 'Word cannot be empty' },
                { status: 400 },
            );
        }

        const language = await prisma.language.findUnique({
            where: { code: languageCode },
        });

        if (!language) {
            return NextResponse.json(
                { error: 'Unsupported language' },
                { status: 400 },
            );
        }

        const existingBaseWord = await findBaseWordByExactMatch(
            trimmedWord,
            language.id,
            translationLanguageCode,
        );

        if (existingBaseWord) {
            return NextResponse.json(
                {
                    success: true,
                    baseWord: existingBaseWord,
                    foundExamples: existingBaseWord.examples?.length || 0,
                    alreadyExists: true,
                },
                { status: 200 },
            );
        }

        const wordData = await getWordData(
            trimmedWord,
            languageCode,
            translationLanguageCode,
            userId,
        );

        if ('error' in wordData) {
            return NextResponse.json(
                { error: wordData.error },
                { status: 500 },
            );
        }

        const result = await createBaseWordFromExternal({
            trimmedWord,
            languageId: language.id,
            translationLanguageCode,
            wordData,
        });

        return NextResponse.json(
            {
                success: true,
                baseWord: result,
                foundExamples: wordData.examples.length,
            },
            { status: 201 },
        );
    } catch (error: any) {
        console.error('Error in AI search:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error.message,
            },
            { status: 500 },
        );
    }
}
