import { prisma } from './prisma';

interface AuditLogParams {
    userId: number | null;
    action: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    metadata?: Record<string, any>;
}

/**
 * Logs user action for security audit
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: params.userId,
                action: params.action,
                ipAddress: params.ipAddress ?? null,
                userAgent: params.userAgent ?? null,
                metadata: params.metadata || undefined,
            },
        });
    } catch (error) {
        // Fail silently - audit logs shouldn't break app flow
        console.error('Failed to log audit:', error);
    }
}

/**
 * Retrieves audit logs for a specific user
 */
export async function getUserAuditLogs(userId: number, limit = 50, offset = 0) {
    return prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
    });
}

/**
 * Retrieves recent failed login attempts
 */
export async function getFailedLoginAttempts(
    email: string,
    minutes = 15,
): Promise<number> {
    const since = new Date(Date.now() - minutes * 60 * 1000);

    const count = await prisma.auditLog.count({
        where: {
            action: 'LOGIN_FAILED',
            createdAt: { gte: since },
            metadata: {
                path: ['email'],
                equals: email,
            },
        },
    });

    return count;
}
