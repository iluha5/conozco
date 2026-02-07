#!/usr/bin/env ts-node

/**
 * Cleanup script for expired auth tokens and old logs
 * Should be run daily via cron job
 *
 * Usage: npx ts-node scripts/cleanup-auth-tokens.ts
 * Cron: 0 2 * * * cd /path/to/app && npx ts-node scripts/cleanup-auth-tokens.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Starting auth tokens cleanup...\n');

    const now = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    try {
        // 1. Cleanup expired email verification tokens
        console.log('📧 Cleaning up expired email verification tokens...');
        const expiredEmailTokens =
            await prisma.emailVerificationToken.deleteMany({
                where: { expires: { lt: now } },
            });
        console.log(
            `   Deleted ${expiredEmailTokens.count} expired email tokens\n`,
        );

        // 2. Cleanup expired password reset tokens
        console.log('🔐 Cleaning up expired password reset tokens...');
        const expiredPasswordTokens =
            await prisma.passwordResetToken.deleteMany({
                where: { expires: { lt: now } },
            });
        console.log(
            `   Deleted ${expiredPasswordTokens.count} expired password reset tokens\n`,
        );

        // 3. Cleanup old rate limit logs (keep only 30 days)
        console.log('⏱️  Cleaning up old rate limit logs (>30 days)...');
        const oldRateLimitLogs = await prisma.rateLimitLog.deleteMany({
            where: { createdAt: { lt: thirtyDaysAgo } },
        });
        console.log(
            `   Deleted ${oldRateLimitLogs.count} old rate limit logs\n`,
        );

        // 4. Cleanup old email logs (keep only 90 days)
        console.log('📬 Cleaning up old email logs (>90 days)...');
        const oldEmailLogs = await prisma.emailLog.deleteMany({
            where: { sentAt: { lt: ninetyDaysAgo } },
        });
        console.log(`   Deleted ${oldEmailLogs.count} old email logs\n`);

        // 5. Cleanup old audit logs (keep only 90 days)
        console.log('📊 Cleaning up old audit logs (>90 days)...');
        const oldAuditLogs = await prisma.auditLog.deleteMany({
            where: { createdAt: { lt: ninetyDaysAgo } },
        });
        console.log(`   Deleted ${oldAuditLogs.count} old audit logs\n`);

        // Summary
        const totalDeleted =
            expiredEmailTokens.count +
            expiredPasswordTokens.count +
            oldRateLimitLogs.count +
            oldEmailLogs.count +
            oldAuditLogs.count;

        console.log('✅ Cleanup completed successfully!');
        console.log(`   Total records deleted: ${totalDeleted}`);
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
