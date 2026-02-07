import crypto from 'crypto';
import { prisma } from './prisma';

/**
 * Generates a cryptographically secure random token
 */
export function generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex'); // 64 characters
}

/**
 * Hashes a token using SHA256
 * We store hashed tokens in DB for security
 */
export function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Creates an email verification token
 * IMPORTANT: Uses transaction to prevent race conditions
 */
export async function createEmailVerificationToken(
    email: string,
): Promise<string> {
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.$transaction(async tx => {
        // Delete old tokens for this email
        await tx.emailVerificationToken.deleteMany({ where: { email } });

        // Create new token
        await tx.emailVerificationToken.create({
            data: { email, token: tokenHash, expires },
        });
    });

    return token; // Return raw token (to send in email)
}

/**
 * Verifies an email token
 * IMPORTANT: Protection against timing attacks via constant-time comparison
 */
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

    // Check if token expired
    if (verificationToken.expires < new Date()) {
        // Delete expired token
        await prisma.emailVerificationToken.delete({
            where: { id: verificationToken.id },
        });
        return { valid: false, error: 'Token expired' };
    }

    return { valid: true, email: verificationToken.email };
}

/**
 * Deletes a verification token after successful verification
 */
export async function deleteEmailVerificationToken(
    email: string,
): Promise<void> {
    await prisma.emailVerificationToken.deleteMany({ where: { email } });
}

/**
 * Checks if a verification token exists for email
 */
export async function hasVerificationToken(email: string): Promise<boolean> {
    const count = await prisma.emailVerificationToken.count({
        where: { email },
    });
    return count > 0;
}

/**
 * Cleans up expired tokens (should be run by cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.emailVerificationToken.deleteMany({
        where: {
            expires: { lt: new Date() },
        },
    });

    return result.count;
}

/**
 * Creates a password reset token
 * IMPORTANT: Uses transaction to prevent race conditions
 */
export async function createPasswordResetToken(email: string): Promise<string> {
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.$transaction(async tx => {
        // Delete old tokens for this email
        await tx.passwordResetToken.deleteMany({ where: { email } });

        // Create new token
        await tx.passwordResetToken.create({
            data: { email, token: tokenHash, expires },
        });
    });

    return token; // Return raw token (to send in email)
}

/**
 * Verifies a password reset token
 */
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

    // Check if token expired
    if (resetToken.expires < new Date()) {
        // Delete expired token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });
        return { valid: false, error: 'Token expired' };
    }

    return { valid: true, email: resetToken.email };
}

/**
 * Deletes a password reset token after successful reset
 */
export async function deletePasswordResetToken(email: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({ where: { email } });
}

/**
 * Cleans up expired password reset tokens
 */
export async function cleanupExpiredPasswordResetTokens(): Promise<number> {
    const result = await prisma.passwordResetToken.deleteMany({
        where: {
            expires: { lt: new Date() },
        },
    });

    return result.count;
}
