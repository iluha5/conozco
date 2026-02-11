import { prisma } from '@/lib/prisma';
import { RateLimitAction } from '@prisma/client';

interface RateLimitParams {
    email?: string;
    ipAddress?: string;
    action: RateLimitAction;
    limitMinutes?: number;
    maxAttempts?: number;
}

interface RateLimitResult {
    allowed: boolean;
    remainingSeconds?: number;
    attemptsCount?: number;
}

/**
 * Checks and logs rate limit atomically
 * Protected against race conditions via transaction
 */
export async function checkAndLogRateLimit(
    params: RateLimitParams,
): Promise<RateLimitResult> {
    const limitMinutes = params.limitMinutes ?? 10;
    const maxAttempts = params.maxAttempts ?? 5;
    const since = new Date(Date.now() - limitMinutes * 60 * 1000);

    try {
        return await prisma.$transaction(async tx => {
            // 1. Check current number of attempts
            const attempts = await tx.rateLimitLog.count({
                where: {
                    action: params.action,
                    createdAt: { gte: since },
                    ...(params.email ? { email: params.email } : {}),
                    ...(params.ipAddress
                        ? { ipAddress: params.ipAddress }
                        : {}),
                },
            });

            // 2. If limit exceeded - don't log, return false
            if (attempts >= maxAttempts) {
                // Find oldest attempt to calculate remaining time
                const oldestAttempt = await tx.rateLimitLog.findFirst({
                    where: {
                        action: params.action,
                        createdAt: { gte: since },
                        ...(params.email ? { email: params.email } : {}),
                        ...(params.ipAddress
                            ? { ipAddress: params.ipAddress }
                            : {}),
                    },
                    orderBy: { createdAt: 'asc' },
                });

                const remainingSeconds = oldestAttempt
                    ? Math.ceil(
                          (oldestAttempt.createdAt.getTime() +
                              limitMinutes * 60 * 1000 -
                              Date.now()) /
                              1000,
                      )
                    : 0;

                return {
                    allowed: false,
                    remainingSeconds: Math.max(0, remainingSeconds),
                    attemptsCount: attempts,
                };
            }

            // 3. Log attempt
            await tx.rateLimitLog.create({
                data: {
                    email: params.email ?? null,
                    ipAddress: params.ipAddress ?? null,
                    action: params.action,
                },
            });

            return { allowed: true, attemptsCount: attempts + 1 };
        });
    } catch (error) {
        console.error('Rate limit check error:', error);
        // On error, fail open (allow the request)
        return { allowed: true };
    }
}

/**
 * Cleans up old rate limit logs (should be run by cron job)
 */
export async function cleanupRateLimitLogs(daysToKeep = 7): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await prisma.rateLimitLog.deleteMany({
        where: {
            createdAt: { lt: cutoffDate },
        },
    });

    return result.count;
}

/**
 * Gets rate limit stats for monitoring
 */
export async function getRateLimitStats(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await prisma.rateLimitLog.groupBy({
        by: ['action'],
        where: {
            createdAt: { gte: since },
        },
        _count: {
            action: true,
        },
    });

    return stats.map(s => ({
        action: s.action,
        count: s._count.action,
    }));
}
