import crypto from 'crypto';
import { prisma } from './prisma';

export function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// We persist only the SHA-256 hash; the raw token is sent to the user once via email.
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Wrapped in a transaction so a parallel request can't leave two valid tokens for the same email.
export async function createEmailVerificationToken(
    email: string,
): Promise<string> {
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.$transaction(async tx => {
        await tx.emailVerificationToken.deleteMany({ where: { email } });
        await tx.emailVerificationToken.create({
            data: { email, token: tokenHash, expires },
        });
    });

    return token;
}

export async function verifyEmailToken(
    token: string,
): Promise<{ valid: boolean; error?: string; email?: string }> {
    const tokenHash = hashToken(token);

    const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token: tokenHash },
    });

    if (!verificationToken) {
        return { valid: false, error: 'Invalid token' };
    }

    if (verificationToken.expires < new Date()) {
        await prisma.emailVerificationToken.delete({
            where: { id: verificationToken.id },
        });
        return { valid: false, error: 'Token expired' };
    }

    return { valid: true, email: verificationToken.email };
}

export async function deleteEmailVerificationToken(
    email: string,
): Promise<void> {
    await prisma.emailVerificationToken.deleteMany({ where: { email } });
}

export async function hasVerificationToken(email: string): Promise<boolean> {
    const count = await prisma.emailVerificationToken.count({
        where: { email },
    });
    return count > 0;
}

export async function cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.emailVerificationToken.deleteMany({
        where: { expires: { lt: new Date() } },
    });

    return result.count;
}

export async function createPasswordResetToken(email: string): Promise<string> {
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.$transaction(async tx => {
        await tx.passwordResetToken.deleteMany({ where: { email } });
        await tx.passwordResetToken.create({
            data: { email, token: tokenHash, expires },
        });
    });

    return token;
}

export async function verifyPasswordResetToken(
    token: string,
): Promise<{ valid: boolean; error?: string; email?: string }> {
    const tokenHash = hashToken(token);

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token: tokenHash },
    });

    if (!resetToken) {
        return { valid: false, error: 'Invalid token' };
    }

    if (resetToken.expires < new Date()) {
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });
        return { valid: false, error: 'Token expired' };
    }

    return { valid: true, email: resetToken.email };
}

export async function deletePasswordResetToken(email: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { email } });
}

export async function cleanupExpiredPasswordResetTokens(): Promise<number> {
    const result = await prisma.passwordResetToken.deleteMany({
        where: { expires: { lt: new Date() } },
    });

    return result.count;
}
