import { Page } from '@playwright/test';
import {
    createAndLoginUser,
    createTestBaseWord,
    createTestWord,
    createTestPrismaClient,
    getLanguageId,
} from './index';
import type { TestUserCredentials } from './auth';
import { TrainingPage } from '../page-objects/TrainingPage';
import { TrainingSetupPage } from '../page-objects/TrainingSetupPage';
import { STAGE_TITLES } from '../utils/training-constants';

/**
 * Word pair for training setup
 */
export interface TrainingWordPair {
    baseWord: Awaited<ReturnType<typeof createTestBaseWord>>;
    word: Awaited<ReturnType<typeof createTestWord>>;
}

/**
 * Result of training setup
 */
export interface TrainingSetupResult {
    user: TestUserCredentials & { id: number };
    trainingPage: TrainingPage;
    trainingSetupPage: TrainingSetupPage;
    baseWord: NonNullable<Awaited<ReturnType<typeof createTestBaseWord>>>;
    word: Awaited<ReturnType<typeof createTestWord>>;
    wordPairs: TrainingWordPair[];
}

/**
 * Get or create a pronoun for a language
 */
async function getOrCreatePronoun(
    languageId: number,
    pronoun: string = 'I',
): Promise<number> {
    const prisma = createTestPrismaClient();

    try {
        const existingPronoun = await prisma.pronoun.findUnique({
            where: {
                pronoun_languageId: {
                    pronoun,
                    languageId,
                },
            },
        });

        if (existingPronoun) {
            return existingPronoun.id;
        }

        const newPronoun = await prisma.pronoun.create({
            data: {
                pronoun,
                languageId,
            },
        });

        return newPronoun.id;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Get sentence type ID by code
 */
async function getSentenceTypeId(
    code: string = 'AFFIRMATIVE',
): Promise<number> {
    const prisma = createTestPrismaClient();

    try {
        const sentenceType = await prisma.sentenceType.findUnique({
            where: { code },
        });

        if (!sentenceType) {
            throw new Error(`Sentence type "${code}" not found`);
        }

        return sentenceType.id;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Create a base word with example sentences
 */
async function createBaseWordWithExamples(
    word: string,
    languageCode: string,
    translation: string,
    translationLanguageCode: string,
    examples: Array<{
        example: string;
        translation: string;
        pronoun?: string;
    }>,
): Promise<Awaited<ReturnType<typeof createTestBaseWord>>> {
    const prisma = createTestPrismaClient();

    try {
        const languageId = await getLanguageId(languageCode);
        const translationLanguageId = await getLanguageId(
            translationLanguageCode,
        );

        // Get source 'native'
        const source = await prisma.wordSource.findUnique({
            where: { code: 'native' },
        });

        if (!source) {
            throw new Error('Word source "native" not found');
        }

        // Get sentence type
        const sentenceTypeId = await getSentenceTypeId('AFFIRMATIVE');

        // Check if base word already exists
        let baseWord = await prisma.baseWord.findUnique({
            where: {
                word_languageId: {
                    word,
                    languageId,
                },
            },
            include: {
                translations: true,
                language: true,
                examples: true,
            },
        });

        if (!baseWord) {
            // Create new base word
            baseWord = await prisma.baseWord.create({
                data: {
                    word,
                    languageId,
                    sourceId: source.id,
                    translations: {
                        create: {
                            languageId: translationLanguageId,
                            translation,
                            priority: 1,
                        },
                    },
                },
                include: {
                    translations: true,
                    language: true,
                    examples: true,
                },
            });
        } else {
            // Check if translation already exists
            const existingTranslation = await prisma.wordTranslation.findFirst({
                where: {
                    baseWordId: baseWord.id,
                    languageId: translationLanguageId,
                },
            });

            if (!existingTranslation) {
                // Add translation to existing word
                await prisma.wordTranslation.create({
                    data: {
                        baseWordId: baseWord.id,
                        languageId: translationLanguageId,
                        translation,
                        priority: 1,
                    },
                });
            }
        }

        // Add example sentences
        for (const exampleData of examples) {
            const pronounText = exampleData.pronoun || 'I';
            const pronounId = await getOrCreatePronoun(languageId, pronounText);

            // Check if such example already exists
            const existingExample = await prisma.wordExample.findFirst({
                where: {
                    baseWordId: baseWord.id,
                    pronounId,
                    example: exampleData.example,
                },
            });

            if (!existingExample) {
                await prisma.wordExample.create({
                    data: {
                        baseWordId: baseWord.id,
                        pronounId,
                        example: exampleData.example,
                        translation: exampleData.translation,
                        translationLanguageId,
                        sentenceTypeId,
                        sourceId: source.id,
                    },
                });
            }
        }

        // Update baseWord object with examples
        baseWord = await prisma.baseWord.findUnique({
            where: { id: baseWord.id },
            include: {
                translations: true,
                language: true,
                examples: {
                    include: {
                        pronoun: true,
                        sentenceType: true,
                        translationLanguage: true,
                    },
                },
            },
        });

        return baseWord;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Create a base word + user word pair
 * @param userId user ID
 * @param word word text
 * @param translation translation text
 * @param wordLang word language code (default 'en')
 * @param translationLang translation language code (default 'ru')
 * @param examples optional example sentences for stage 5
 * @returns base word and user word pair
 */
export async function createTrainingWordPair(
    userId: number,
    word: string,
    translation: string,
    wordLang: string = 'en',
    translationLang: string = 'ru',
    examples?: Array<{
        example: string;
        translation: string;
        pronoun?: string;
    }>,
): Promise<TrainingWordPair> {
    // Create base word
    let baseWord: Awaited<ReturnType<typeof createTestBaseWord>>;

    if (examples && examples.length > 0) {
        // Create word with examples
        baseWord = await createBaseWordWithExamples(
            word,
            wordLang,
            translation,
            translationLang,
            examples,
        );
    } else {
        // Create regular word without examples
        baseWord = await createTestBaseWord(
            word,
            wordLang,
            translation,
            translationLang,
        );
    }

    if (!baseWord) {
        throw new Error('Failed to create base word');
    }

    // Create word for user
    const userWord = await createTestWord(userId, {
        baseWordId: baseWord.id,
        languageCode: wordLang,
    });

    return {
        baseWord,
        word: userWord,
    };
}

/**
 * Set up training: create user, words, and start training
 * @param page Playwright page
 * @param words words to create (default single hello word with Russian translation)
 * @returns training setup result
 */
export async function setupTrainingWithWords(
    page: Page,
    words: Array<{
        word: string;
        translation: string;
        examples?: Array<{
            example: string;
            translation: string;
            pronoun?: string;
        }>;
    }> = [{ word: 'hello', translation: 'привет' }],
): Promise<TrainingSetupResult> {
    // 1. User creation
    const user = await createAndLoginUser(page);

    // 2. Word creation
    const wordPairs = await Promise.all(
        words.map(w =>
            createTrainingWordPair(
                user.id,
                w.word,
                w.translation,
                'en',
                'ru',
                w.examples,
            ),
        ),
    );

    // 3. Training setup
    const trainingSetupPage = new TrainingSetupPage(page);
    await trainingSetupPage.goto();
    await trainingSetupPage.expectPageLoaded();

    // 4. Training start
    const started = await trainingSetupPage.waitAndStartTraining();
    if (!started) {
        throw new Error('Failed to start training - start button not enabled');
    }

    // 5. Wait for start
    await page.waitForURL(/\/training/, { timeout: 5000 });

    // 6. Create TrainingPage
    const trainingPage = new TrainingPage(page);
    await trainingPage.waitForTrainingStart();

    const firstPair = wordPairs[0];
    if (!firstPair.baseWord) {
        throw new Error('Failed to create base word');
    }

    return {
        user,
        trainingPage,
        trainingSetupPage,
        baseWord: firstPair.baseWord,
        word: firstPair.word,
        wordPairs,
    };
}

/**
 * Open a specific training stage
 * @param page Playwright page
 * @param stage stage number (1-6)
 * @param trainingPage optional existing TrainingPage instance
 * @returns TrainingPage instance
 */
export async function openTrainingStage(
    page: Page,
    stage: 1 | 2 | 3 | 4 | 5 | 6,
    trainingPage?: TrainingPage,
): Promise<TrainingPage> {
    const tp = trainingPage || new TrainingPage(page);

    // Check that training page is loaded
    await tp.expectPageLoaded();

    // Click on stage
    await tp.clickStage(stage);

    // Wait for stage title to appear instead of fixed timeout
    const expectedTitle = STAGE_TITLES[stage];
    await tp.expectStageTitle(expectedTitle);

    return tp;
}
