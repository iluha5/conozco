#!/usr/bin/env ts-node

// Daily cron: deletes expired auth tokens and rotates rate-limit / email / audit logs.
// Usage: npx ts-node scripts/cleanup-auth-tokens.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    const now = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    try {
        const expiredEmailTokens =
            await prisma.emailVerificationToken.deleteMany({
                where: { expires: { lt: now } },
            });
        const expiredPasswordTokens =
            await prisma.passwordResetToken.deleteMany({
                where: { expires: { lt: now } },
            });
        const oldRateLimitLogs = await prisma.rateLimitLog.deleteMany({
            where: { createdAt: { lt: thirtyDaysAgo } },
        });
        const oldEmailLogs = await prisma.emailLog.deleteMany({
            where: { sentAt: { lt: ninetyDaysAgo } },
        });
        const oldAuditLogs = await prisma.auditLog.deleteMany({
            where: { createdAt: { lt: ninetyDaysAgo } },
        });

        const totalDeleted =
            expiredEmailTokens.count +
            expiredPasswordTokens.count +
            oldRateLimitLogs.count +
            oldEmailLogs.count +
            oldAuditLogs.count;

        console.log(
            `Cleanup done: ${totalDeleted} records deleted ` +
                `(emailTokens=${expiredEmailTokens.count}, ` +
                `passwordTokens=${expiredPasswordTokens.count}, ` +
                `rateLimit=${oldRateLimitLogs.count}, ` +
                `email=${oldEmailLogs.count}, ` +
                `audit=${oldAuditLogs.count})`,
        );
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
