import { createTestPrismaClient } from './db';

/**
 * Генераторы тестовых данных для E2E тестов
 */

/**
 * Создает тестового пользователя
 */
export async function createTestUser(
    email: string = `test-${Date.now()}@example.com`,
    password: string = 'testpassword123',
    name?: string,
) {
    const prisma = createTestPrismaClient();
    const bcrypt = require('bcryptjs');

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || `Test User ${Date.now()}`,
                roleId: 1, // USER role
            },
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
        statusId?: number;
    } = {},
) {
    const prisma = createTestPrismaClient();

    try {
        const word = await prisma.word.create({
            data: {
                userId,
                baseWordId: options.baseWordId || null,
                customWord: options.customWord || null,
                languageId: options.languageId || 1, // English by default
                statusId: options.statusId || 1, // NOT_LEARNED by default
            },
            include: {
                baseWord: {
                    include: {
                        translations: true,
                    },
                },
                language: true,
                status: true,
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
    languageId: number = 1,
) {
    const prisma = createTestPrismaClient();

    try {
        const wordGroup = await prisma.wordGroup.create({
            data: {
                name: `test-group-${Date.now()}-${name}`,
                createdByUserId,
                languageId,
                visibility: 'PRIVATE',
            },
        });

        return wordGroup;
    } finally {
        await prisma.$disconnect();
    }
}
