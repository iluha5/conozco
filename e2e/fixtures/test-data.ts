import { createTestPrismaClient } from './db';

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
export async function createTestUser(
    email: string = `test-${Date.now()}@example.com`,
    password: string = 'testpassword123',
    name?: string,
    options?: {
        roleId?: number;
        ownLanguageId?: number;
        learnLanguageId?: number;
        interfaceLanguageId?: number;
    },
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
            name: name || `Test User ${Date.now()}`,
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
            languageId = await getLanguageId('en'); // English by default
        }

        // Определяем statusId
        let statusId = options.statusId;
        if (!statusId && options.statusCode) {
            statusId = await getWordStatusId(options.statusCode);
        }
        if (!statusId) {
            statusId = await getWordStatusId('NOT_LEARNED'); // NOT_LEARNED by default
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
            languageId = await getLanguageId('en'); // English by default
        }

        const wordGroup = await prisma.wordGroup.create({
            data: {
                name: `test-group-${Date.now()}-${name}`,
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
            customWord: `test-word-${Date.now()}-${i}`,
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

        const baseWord = await prisma.baseWord.create({
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

        return baseWord;
    } finally {
        await prisma.$disconnect();
    }
}
