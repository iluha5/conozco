import { PrismaClient } from '@prisma/client';
import { TEST_DATABASE_URL } from '../test-env';

export { TEST_DATABASE_URL };

/**
 * Create a new Prisma Client instance for the test database
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
 * Clean up the test database
 * Deletes all data from tables (except reference data)
 */
export async function cleanupTestDatabase(): Promise<void> {
    const prisma = createTestPrismaClient();

    try {
        // Delete data in correct order (considering foreign keys)
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
 * Run a transaction for test isolation
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
