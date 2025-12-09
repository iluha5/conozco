import { PrismaClient } from '@prisma/client';

/**
 * URL тестовой базы данных
 */
export const TEST_DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    'postgresql://flashcards_test:flashcards_test_password@localhost:5434/flashcards_test';

/**
 * Создает новый экземпляр Prisma Client для тестовой БД
 */
export function createTestPrismaClient(): PrismaClient {
    return new PrismaClient({
        datasources: {
            db: {
                url: TEST_DATABASE_URL,
            },
        },
    });
}

/**
 * Очищает тестовую базу данных
 * Удаляет все данные из всех таблиц (кроме справочных данных)
 */
export async function cleanupTestDatabase(): Promise<void> {
    const prisma = createTestPrismaClient();

    try {
        // Удаляем данные в правильном порядке (с учетом foreign keys)
        await prisma.trainingLog.deleteMany();
        await prisma.trainingSession.deleteMany();
        await prisma.apiRequestLog.deleteMany();
        await prisma.customTranslation.deleteMany();
        await prisma.word.deleteMany();
        await prisma.userWordGroup.deleteMany();
        await prisma.wordGroupAccess.deleteMany();
        await prisma.baseWordOnWordGroup.deleteMany();
        await prisma.wordGroup.deleteMany();
        await prisma.user.deleteMany();

        console.log('✅ Test database cleaned up');
    } catch (error) {
        console.error('❌ Error cleaning up test database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Выполняет транзакцию для изоляции тестов
 */
export async function withTransaction<T>(
    callback: (_prisma: PrismaClient) => Promise<T>,
): Promise<T> {
    const prisma = createTestPrismaClient();

    try {
        return await prisma.$transaction(async tx => {
            return await callback(tx as PrismaClient);
        });
    } finally {
        await prisma.$disconnect();
    }
}
