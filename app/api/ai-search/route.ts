import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getWordData } from '@/lib/translation-api';

/**
 * POST /api/ai-search
 * Searches for word via LibreTranslate and Tatoeba, then adds it to database
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

        // Determine translation language (user's ownLanguage)
        const translationLanguageCode = user.ownLanguage?.code || 'ru';

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

        const existingBaseWord = await prisma.baseWord.findUnique({
            where: {
                word_languageId: {
                    word: trimmedWord,
                    languageId: language.id,
                },
            },
            include: {
                language: true,
                translations: {
                    where: { language: { code: translationLanguageCode } },
                    orderBy: { priority: 'asc' },
                    include: {
                        partOfSpeech: true,
                    },
                },
                examples: {
                    where: {
                        translationLanguage: { code: translationLanguageCode },
                    },
                    include: {
                        pronoun: true,
                        sentenceType: true,
                        translationLanguage: true,
                    },
                },
                grammaticalExamples: {
                    where: {
                        translationLanguage: { code: translationLanguageCode },
                    },
                    include: {
                        pronoun: true,
                        tense: true,
                        sentenceType: true,
                    },
                },
            },
        });

        // If word already exists in database, just return it
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

        // Search for word via external APIs
        const wordData = await getWordData(
            trimmedWord,
            languageCode,
            translationLanguageCode, // Target language - user native language
            userId,
        );

        if ('error' in wordData) {
            return NextResponse.json(
                { error: wordData.error },
                { status: 500 },
            );
        }

        // Get sources for AI search
        const deeplSource = await prisma.wordSource.findUnique({
            where: { code: 'DEEPL' },
        });

        const myMemorySource = await prisma.wordSource.findUnique({
            where: { code: 'MYMEMORY' },
        });

        const tatoebaSource = await prisma.wordSource.findUnique({
            where: { code: 'TATOEBA' },
        });

        if (!deeplSource || !myMemorySource || !tatoebaSource) {
            return NextResponse.json(
                { error: 'Required word sources not found in database' },
                { status: 500 },
            );
        }

        // Determine which source to use for BaseWord (DeepL or MyMemory)
        const wordSourceId =
            wordData.source === 'DEEPL' ? deeplSource.id : myMemorySource.id;

        // Create base word in transaction
        const result = await prisma.$transaction(async tx => {
            const baseWord = await tx.baseWord.create({
                data: {
                    word: trimmedWord,
                    language: {
                        connect: { id: language.id },
                    },
                    source: {
                        connect: { id: wordSourceId },
                    },
                },
            });

            // Get language for translations (user's native language)
            const targetLanguage = await tx.language.findUnique({
                where: { code: translationLanguageCode },
            });

            if (!targetLanguage) {
                throw new Error(
                    `Target language (${translationLanguageCode}) not found`,
                );
            }

            // Add translations (if they don't exist yet)
            const existingTranslations = await tx.wordTranslation.findMany({
                where: {
                    baseWordId: baseWord.id,
                    languageId: targetLanguage.id,
                },
            });

            if (existingTranslations.length === 0) {
                // Add main translation
                // Note: partOfSpeechId is not added because AI search API doesn't return this information
                // Part of speech can be added manually by user or through other sources
                await tx.wordTranslation.create({
                    data: {
                        baseWordId: baseWord.id,
                        languageId: targetLanguage.id,
                        translation: wordData.mainTranslation,
                        priority: 1,
                        // partOfSpeechId: null - default
                    },
                });

                // Add alternative translations
                for (
                    let i = 0;
                    i < wordData.alternativeTranslations.length && i < 2;
                    i++
                ) {
                    const alt = wordData.alternativeTranslations[i];
                    if (alt && alt !== wordData.mainTranslation) {
                        await tx.wordTranslation.create({
                            data: {
                                baseWordId: baseWord.id,
                                languageId: targetLanguage.id,
                                translation: alt,
                                priority: i + 2,
                                // partOfSpeechId: null - default
                            },
                        });
                    }
                }
            }

            // Add sentence examples (if they don't exist yet and were found)
            if (wordData.examples.length > 0) {
                const existingExamples = await tx.wordExample.findMany({
                    where: { baseWordId: baseWord.id },
                });

                if (existingExamples.length === 0) {
                    // Get default pronoun and sentence type
                    const defaultPronoun = await tx.pronoun.findFirst({
                        where: { languageId: language.id },
                    });

                    const defaultSentenceType = await tx.sentenceType.findFirst(
                        {
                            where: {
                                isNegative: false,
                                isQuestion: false,
                            },
                        },
                    );

                    if (defaultPronoun && defaultSentenceType) {
                        // Add up to 5 examples from Tatoeba
                        for (
                            let i = 0;
                            i < Math.min(5, wordData.examples.length);
                            i++
                        ) {
                            const example = wordData.examples[i];
                            await tx.wordExample.create({
                                data: {
                                    baseWordId: baseWord.id,
                                    pronounId: defaultPronoun.id,
                                    example: example.sentence,
                                    translation: example.translation,
                                    translationLanguageId: targetLanguage.id,
                                    sentenceTypeId: defaultSentenceType.id,
                                    sourceId: tatoebaSource.id,
                                },
                            });
                        }
                    }
                }
            }

            // Return base word with additional data
            const completeBaseWord = await tx.baseWord.findUnique({
                where: { id: baseWord.id },
                include: {
                    language: true,
                    translations: {
                        where: { language: { code: translationLanguageCode } },
                        orderBy: { priority: 'asc' },
                        include: {
                            partOfSpeech: true,
                        },
                    },
                    examples: {
                        where: {
                            translationLanguage: {
                                code: translationLanguageCode,
                            },
                        },
                        include: {
                            pronoun: true,
                            sentenceType: true,
                            translationLanguage: true,
                        },
                    },
                    grammaticalExamples: {
                        where: {
                            translationLanguage: {
                                code: translationLanguageCode,
                            },
                        },
                        include: {
                            pronoun: true,
                            tense: true,
                            sentenceType: true,
                        },
                    },
                },
            });

            return completeBaseWord;
        });

        // Return result
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
