import { createTestPrismaClient } from './db';
import {
    generateUniqueEmail,
    generateUniqueName,
    generateUniqueGroupName,
} from '../utils/test-helpers';
import { DEFAULT_TEST_VALUES } from '../utils/constants';

/**
 * Генераторы тестовых данных для E2E тестов
 */

/**
 * Получает ID роли пользователя по коду
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
 * Получает ID статуса слова по коду
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
 * Получает ID языка по коду
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
 * Создает тестового пользователя
 */
/**
 * Опции для создания тестового пользователя
 */
export interface CreateTestUserOptions {
    roleId?: number;
    ownLanguageId?: number;
    learnLanguageId?: number;
    interfaceLanguageId?: number;
}

/**
 * Создает тестового пользователя
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

        // Создаем пользователя с минимальными полями (без языков, если они не поддерживаются в БД)
        const userData: any = {
            email,
            password: hashedPassword,
            name: name || generateUniqueName(),
            roleId,
        };

        // Добавляем языки только если они указаны
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
 * Создает тестовое слово для пользователя
 */
export async function createTestWord(
    userId: number,
    options: {
        baseWordId?: number;
        customWord?: string;
        languageId?: number;
        languageCode?: string; // Альтернатива languageId
        statusId?: number;
        statusCode?: 'NOT_LEARNED' | 'LEARNED'; // Альтернатива statusId
        selectedTranslationId?: number;
    } = {},
) {
    const prisma = createTestPrismaClient();

    try {
        // Определяем languageId
        let languageId = options.languageId;
        if (!languageId && options.languageCode) {
            languageId = await getLanguageId(options.languageCode);
        }
        if (!languageId) {
            languageId = await getLanguageId(DEFAULT_TEST_VALUES.LANGUAGE_CODE);
        }

        // Определяем statusId
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
 * Создает тестовую группу слов
 */
export async function createTestWordGroup(
    createdByUserId: number,
    name: string,
    options?: {
        languageId?: number;
        languageCode?: string; // Альтернатива languageId
        visibility?: 'PRIVATE' | 'PUBLIC';
    },
) {
    const prisma = createTestPrismaClient();

    try {
        // Определяем languageId
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
 * Создает несколько тестовых слов для пользователя
 * @param userId ID пользователя
 * @param count Количество слов для создания
 * @param options Опции для всех слов
 * @returns Массив созданных слов
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
 * Создает базовое слово с переводом (для использования в тестах)
 * @param word Текст слова
 * @param languageCode Код языка слова
 * @param translation Текст перевода
 * @param translationLanguageCode Код языка перевода
 * @returns Созданное базовое слово с переводом
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

        // Получаем источник 'native'
        const source = await prisma.wordSource.findUnique({
            where: { code: 'native' },
        });

        if (!source) {
            throw new Error('Word source "native" not found');
        }

        // Проверяем, существует ли уже базовое слово
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
            // Создаем новое базовое слово
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
            // Проверяем, существует ли уже перевод
            const existingTranslation = await prisma.wordTranslation.findFirst({
                where: {
                    baseWordId: baseWord.id,
                    languageId: translationLanguageId,
                },
            });

            if (!existingTranslation) {
                // Добавляем перевод к существующему слову
                await prisma.wordTranslation.create({
                    data: {
                        baseWordId: baseWord.id,
                        languageId: translationLanguageId,
                        translation,
                        priority: 1,
                    },
                });

                // Обновляем объект baseWord с новым переводом
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
