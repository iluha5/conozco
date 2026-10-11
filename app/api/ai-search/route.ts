import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWordData } from '@/lib/translation-api';
import { translateWithDeepL } from '@/lib/deepl-api';
import {
    decideInputLanguage,
    directionAfterDeepLDetect,
} from '@/lib/language-detect';
import { dictionaryMembership } from '@/lib/hunspell-membership';
import {
    createBaseWordFromExternal,
    findBaseWordByExactMatch,
} from '@/lib/words/createBaseWordFromExternal';
import {
    addFromNativeInput,
    addLearnWordFromKnownTranslation,
    type ExternalLookupSuccess,
} from '@/lib/words/externalWordLookup';

const INPUT_ERRORS = {
    'mixed-script': 'Enter a word in one language',
    'outside-pair': 'This word does not match your learning or native language',
} as const;

function lookupResponse(result: ExternalLookupSuccess, status: number) {
    return NextResponse.json(
        {
            success: true,
            baseWord: result.baseWord,
            foundExamples: result.foundExamples,
            alreadyExists: result.alreadyExists,
            resolvedWord: result.resolvedWord,
        },
        { status },
    );
}

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

        const ownLanguageCode = user.ownLanguage?.code ?? null;
        const translationLanguageCode = ownLanguageCode || 'en';

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

        const decision = decideInputLanguage({
            text: trimmedWord,
            learnLanguage: languageCode,
            ownLanguage: ownLanguageCode,
            membership: dictionaryMembership,
        });

        if (decision.kind === 'reject') {
            return NextResponse.json(
                {
                    error: INPUT_ERRORS[decision.reason],
                    errorCode: decision.reason,
                },
                { status: 400 },
            );
        }

        if (decision.kind === 'reverse') {
            const nativeResult = await addFromNativeInput({
                nativeWord: trimmedWord,
                learnLanguage: languageCode,
                learnLanguageId: language.id,
                ownLanguage: translationLanguageCode,
                userId,
            });

            if ('error' in nativeResult) {
                return NextResponse.json(
                    { error: nativeResult.error },
                    { status: 500 },
                );
            }

            return lookupResponse(
                nativeResult,
                nativeResult.alreadyExists ? 200 : 201,
            );
        }

        if (decision.kind === 'unknown' && ownLanguageCode) {
            const detected = await translateWithDeepL(
                trimmedWord,
                null,
                ownLanguageCode,
                userId,
                1,
            );
            const direction = directionAfterDeepLDetect({
                detectedLanguage: detected.detectedSourceLanguage ?? null,
                sourceEqualsTarget: detected.sourceEqualsTarget ?? false,
                learnLanguage: languageCode,
                ownLanguage: ownLanguageCode,
            });

            if (direction === 'reverse') {
                const nativeResult = await addFromNativeInput({
                    nativeWord: trimmedWord,
                    learnLanguage: languageCode,
                    learnLanguageId: language.id,
                    ownLanguage: ownLanguageCode,
                    userId,
                });

                if ('error' in nativeResult) {
                    return NextResponse.json(
                        { error: nativeResult.error },
                        { status: 500 },
                    );
                }

                return lookupResponse(
                    nativeResult,
                    nativeResult.alreadyExists ? 200 : 201,
                );
            }

            if (
                detected.detectedSourceLanguage === languageCode &&
                detected.mainTranslation &&
                !detected.error
            ) {
                const existingBaseWord = await findBaseWordByExactMatch(
                    trimmedWord,
                    language.id,
                    ownLanguageCode,
                );

                if (existingBaseWord) {
                    return lookupResponse(
                        {
                            baseWord: existingBaseWord,
                            foundExamples:
                                existingBaseWord.examples?.length ?? 0,
                            resolvedWord: existingBaseWord.word,
                            alreadyExists: true,
                        },
                        200,
                    );
                }

                const created = await addLearnWordFromKnownTranslation({
                    learnWord: trimmedWord,
                    learnLanguage: languageCode,
                    learnLanguageId: language.id,
                    ownLanguage: ownLanguageCode,
                    userId,
                    mainTranslation: detected.mainTranslation,
                    alternativeTranslations: detected.alternatives,
                    source: 'DEEPL',
                });

                return lookupResponse(created, 201);
            }
        }

        const existingBaseWord = await findBaseWordByExactMatch(
            trimmedWord,
            language.id,
            translationLanguageCode,
        );

        if (existingBaseWord) {
            return lookupResponse(
                {
                    baseWord: existingBaseWord,
                    foundExamples: existingBaseWord.examples?.length ?? 0,
                    resolvedWord: existingBaseWord.word,
                    alreadyExists: true,
                },
                200,
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

        const created = await createBaseWordFromExternal({
            trimmedWord,
            languageId: language.id,
            translationLanguageCode,
            wordData,
        });

        return lookupResponse(
            {
                baseWord: created,
                foundExamples: wordData.examples.length,
                resolvedWord: trimmedWord,
                alreadyExists: false,
            },
            201,
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
