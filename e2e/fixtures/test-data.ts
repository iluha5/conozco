import { createTestPrismaClient } from './db';
import {
    generateUniqueEmail,
    generateUniqueName,
    generateUniqueGroupName,
} from '../utils/test-helpers';
import { DEFAULT_TEST_VALUES } from '../utils/constants';

/**
 * Test data generators for E2E tests
 */

/**
 * Get user role ID by code
 */
export async function getRoleId(code: 'USER' | 'ADMIN'): Promise<number> {
    const prisma = createTestPrismaClient();

    try {
        const role = await prisma.userRole.findUnique({
            where: { code },
        });

        if (!role) {
            throw new Error(`Role ${code} not found`);
        }

        return role.id;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Get word status ID by code
 */
export async function getWordStatusId(
    code: 'NOT_LEARNED' | 'LEARNED',
): Promise<number> {
    const prisma = createTestPrismaClient();

    try {
        const status = await prisma.wordStatus.findUnique({
            where: { code },
        });

        if (!status) {
            throw new Error(`Word status ${code} not found`);
        }

        return status.id;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Get language ID by code
 */
export async function getLanguageId(code: string): Promise<number> {
    const prisma = createTestPrismaClient();

    try {
        const language = await prisma.language.findUnique({
            where: { code },
        });

        if (!language) {
            throw new Error(`Language ${code} not found`);
        }

        return language.id;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Options for creating a test user
 */
export interface CreateTestUserOptions {
    roleId?: number;
    ownLanguageId?: number;
    learnLanguageId?: number;
    interfaceLanguageId?: number;
}

/**
 * Create a test user
 */
export async function createTestUser(
    email: string = generateUniqueEmail(),
    password: string = DEFAULT_TEST_VALUES.PASSWORD,
    name?: string,
    options?: CreateTestUserOptions,
) {
    const prisma = createTestPrismaClient();
    const bcrypt = require('bcryptjs');

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const roleId = options?.roleId || (await getRoleId('USER'));

        // Create user with minimal fields (languages omitted unless provided)
        const userData: any = {
            email,
            password: hashedPassword,
            name: name || generateUniqueName(),
            roleId,
        };

        // Add language fields only when provided
        if (options?.ownLanguageId !== undefined) {
            userData.ownLanguageId = options.ownLanguageId;
        }
        if (options?.learnLanguageId !== undefined) {
            userData.learnLanguageId = options.learnLanguageId;
        }
        if (options?.interfaceLanguageId !== undefined) {
            userData.interfaceLanguageId = options.interfaceLanguageId;
        }

        const user = await prisma.user.create({
            data: userData,
            include: {
                role: true,
            },
        });

        return user;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Create a test word for a user
 */
export async function createTestWord(
    userId: number,
    options: {
        baseWordId?: number;
        customWord?: string;
        languageId?: number;
        languageCode?: string; // Alternative to languageId
        statusId?: number;
        statusCode?: 'NOT_LEARNED' | 'LEARNED'; // Alternative to statusId
        selectedTranslationId?: number;
    } = {},
) {
    const prisma = createTestPrismaClient();

    try {
        // Resolve languageId
        let languageId = options.languageId;
        if (!languageId && options.languageCode) {
            languageId = await getLanguageId(options.languageCode);
        }
        if (!languageId) {
            languageId = await getLanguageId(DEFAULT_TEST_VALUES.LANGUAGE_CODE);
        }

        // Resolve statusId
        let statusId = options.statusId;
        if (!statusId && options.statusCode) {
            statusId = await getWordStatusId(options.statusCode);
        }
        if (!statusId) {
            statusId = await getWordStatusId(DEFAULT_TEST_VALUES.WORD_STATUS);
        }

        const word = await prisma.word.create({
            data: {
                userId,
                baseWordId: options.baseWordId || null,
                customWord: options.customWord || null,
                languageId,
                statusId,
                selectedTranslationId: options.selectedTranslationId || null,
            },
            include: {
                baseWord: {
                    include: {
                        translations: true,
                    },
                },
                language: true,
                status: true,
                selectedTranslation: true,
            },
        });

        return word;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Create a test word group
 */
export async function createTestWordGroup(
    createdByUserId: number,
    name: string,
    options?: {
        languageId?: number;
        languageCode?: string; // Alternative to languageId
        visibility?: 'PRIVATE' | 'PUBLIC';
    },
) {
    const prisma = createTestPrismaClient();

    try {
        // Resolve languageId
        let languageId = options?.languageId;
        if (!languageId && options?.languageCode) {
            languageId = await getLanguageId(options.languageCode);
        }
        if (!languageId) {
            languageId = await getLanguageId(DEFAULT_TEST_VALUES.LANGUAGE_CODE);
        }

        const wordGroup = await prisma.wordGroup.create({
            data: {
                name: generateUniqueGroupName(name),
                createdByUserId,
                languageId,
                visibility: options?.visibility || 'PRIVATE',
            },
            include: {
                language: true,
            },
        });

        return wordGroup;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Create multiple test words for a user
 * @param userId user ID
 * @param count number of words to create
 * @param options options applied to each word
 * @returns array of created words
 */
export async function createTestWords(
    userId: number,
    count: number,
    options?: {
        languageId?: number;
        languageCode?: string;
        statusId?: number;
        statusCode?: 'NOT_LEARNED' | 'LEARNED';
    },
): Promise<any[]> {
    const words: any[] = [];

    for (let i = 0; i < count; i++) {
        const word = await createTestWord(userId, {
            ...options,
            customWord: `test-word-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${i}`,
        });
        words.push(word);
    }

    return words;
}

/**
 * Create a base word with translation (for use in tests)
 * @param word word text
 * @param languageCode word language code
 * @param translation translation text
 * @param translationLanguageCode translation language code
 * @returns created base word with translation
 */
export async function createTestBaseWord(
    word: string,
    languageCode: string,
    translation: string,
    translationLanguageCode: string,
) {
    const prisma = createTestPrismaClient();

    try {
        const languageId = await getLanguageId(languageCode);
        const translationLanguageId = await getLanguageId(
            translationLanguageCode,
        );

        // Get 'native' word source
        const source = await prisma.wordSource.findUnique({
            where: { code: 'native' },
        });

        if (!source) {
            throw new Error('Word source "native" not found');
        }

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

                // Refresh baseWord with new translation
                baseWord = await prisma.baseWord.findUnique({
                    where: { id: baseWord.id },
                    include: {
                        translations: true,
                        language: true,
                    },
                });
            }
        }

        return baseWord;
    } finally {
        await prisma.$disconnect();
    }
}
