import { Resend } from 'resend';
import { prisma } from './prisma';
import { EmailType } from '@prisma/client';
import {
    getVerificationEmailHtml,
    getPasswordResetEmailHtml,
    getWelcomeEmailHtml,
} from './email-utils';

// Lazy initialization to avoid requiring API key during build time
let resendClient: Resend | null = null;

function getResendClient(): Resend {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error(
                'RESEND_API_KEY is required. Set it in environment variables.',
            );
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
}

interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Sends email verification email
 */
export async function sendVerificationEmail(
    email: string,
    token: string,
): Promise<SendEmailResult> {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
    const { subject, html } = getVerificationEmailHtml(verificationUrl);

    try {
        const result = await getResendClient().emails.send({
            from: process.env.EMAIL_FROM || 'noreply@conozco.net',
            to: email,
            subject,
            html,
        });

        await prisma.emailLog.create({
            data: {
                email,
                type: EmailType.EMAIL_VERIFICATION,
                status: 'SUCCESS',
                provider: 'RESEND',
                messageId: result.data?.id || null,
            },
        });

        return { success: true, messageId: result.data?.id };
    } catch (error) {
        console.error('Email send error:', error);

        await prisma.emailLog.create({
            data: {
                email,
                type: EmailType.EMAIL_VERIFICATION,
                status: 'FAILED',
                provider: 'RESEND',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Sends password reset email
 */
export async function sendPasswordResetEmail(
    email: string,
    token: string,
): Promise<SendEmailResult> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    const { subject, html } = getPasswordResetEmailHtml(resetUrl);

    try {
        const result = await getResendClient().emails.send({
            from: process.env.EMAIL_FROM || 'noreply@conozco.net',
            to: email,
            subject,
            html,
        });

        await prisma.emailLog.create({
            data: {
                email,
                type: EmailType.PASSWORD_RESET,
                status: 'SUCCESS',
                provider: 'RESEND',
                messageId: result.data?.id || null,
            },
        });

        return { success: true, messageId: result.data?.id };
    } catch (error) {
        console.error('Email send error:', error);

        await prisma.emailLog.create({
            data: {
                email,
                type: EmailType.PASSWORD_RESET,
                status: 'FAILED',
                provider: 'RESEND',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Sends welcome email after successful verification
 */
export async function sendWelcomeEmail(
    email: string,
): Promise<SendEmailResult> {
    const loginUrl = `${process.env.NEXTAUTH_URL}/auth/login`;
    const { subject, html } = getWelcomeEmailHtml(loginUrl);

    try {
        const result = await getResendClient().emails.send({
            from: process.env.EMAIL_FROM || 'noreply@conozco.net',
            to: email,
            subject,
            html,
        });

        await prisma.emailLog.create({
            data: {
                email,
                type: EmailType.WELCOME,
                status: 'SUCCESS',
                provider: 'RESEND',
                messageId: result.data?.id || null,
            },
        });

        return { success: true, messageId: result.data?.id };
    } catch (error) {
        console.error('Email send error:', error);

        await prisma.emailLog.create({
            data: {
                email,
                type: EmailType.WELCOME,
                status: 'FAILED',
                provider: 'RESEND',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Cleanup expired tokens and old logs (should be run by cron job)
 */
export async function cleanupEmailData(): Promise<{
    emailLogs: number;
    expiredTokens: number;
}> {
    const now = new Date();
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days

    const [emailLogs, expiredTokens] = await Promise.all([
        // Delete old email logs (90 days)
        prisma.emailLog.deleteMany({
            where: {
                sentAt: { lt: cutoffDate },
            },
        }),
        // Delete expired verification tokens
        prisma.emailVerificationToken.deleteMany({
            where: { expires: { lt: now } },
        }),
    ]);

    return {
        emailLogs: emailLogs.count,
        expiredTokens: expiredTokens.count,
    };
}

/**
 * Webhook handler for Resend events
 * Handles bounced/complained emails
 */
export async function handleResendWebhook(event: any): Promise<void> {
    try {
        switch (event.type) {
            case 'email.bounced':
                await prisma.user.updateMany({
                    where: { email: event.data.email },
                    data: { emailBounced: true },
                });
                console.log(`Marked email as bounced: ${event.data.email}`);
                break;

            case 'email.complained':
                // Can add spamComplaint flag if needed
                console.log(`Spam complaint received: ${event.data.email}`);
                break;

            case 'email.delivered':
                // Optionally update EmailLog status
                break;
        }
    } catch (error) {
        console.error('Webhook processing error:', error);
    }
}

/**
 * Validates email service configuration
 */
export function validateEmailConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!process.env.RESEND_API_KEY) {
        errors.push('RESEND_API_KEY is not configured');
    }

    if (!process.env.EMAIL_FROM) {
        errors.push('EMAIL_FROM is not configured');
    }

    if (!process.env.NEXTAUTH_URL) {
        errors.push('NEXTAUTH_URL is not configured');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
