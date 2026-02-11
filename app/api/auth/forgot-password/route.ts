import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIpAddress } from '@/lib/ip-utils';
import { checkAndLogRateLimit } from '@/lib/rate-limit';
import { sanitizeEmail, isValidEmail } from '@/lib/validation';
import { createPasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email: rawEmail } = body;

        if (!rawEmail) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 },
            );
        }

        const email = sanitizeEmail(rawEmail);

        // Validate email format
        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 },
            );
        }

        const ipAddress = getIpAddress(request);

        // Check rate limit
        const rateLimit = await checkAndLogRateLimit({
            email,
            ipAddress: ipAddress || undefined,
            action: 'FORGOT',
            limitMinutes: 60,
            maxAttempts: 3,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many password reset attempts',
                    retryAfter: rateLimit.remainingSeconds,
                },
                { status: 429 },
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, emailVerified: true, password: true },
        });

        // IMPORTANT: Don't reveal if user exists or not (for security)
        // Always return success message
        if (!user) {
            return NextResponse.json(
                {
                    success: true,
                    message:
                        'If the email exists, a password reset link has been sent.',
                },
                { status: 200 },
            );
        }

        // Check if user has a password (not OAuth-only)
        if (!user.password) {
            // User is OAuth-only, but don't reveal this
            return NextResponse.json(
                {
                    success: true,
                    message:
                        'If the email exists, a password reset link has been sent.',
                },
                { status: 200 },
            );
        }

        // Check if email is verified
        if (!user.emailVerified) {
            return NextResponse.json(
                {
                    error: 'Email not verified',
                    message:
                        'Please verify your email before resetting password.',
                },
                { status: 400 },
            );
        }

        // Create password reset token
        const token = await createPasswordResetToken(email);

        // Send password reset email
        const emailResult = await sendPasswordResetEmail(email, token);

        if (!emailResult.success) {
            console.error(
                'Failed to send password reset email:',
                emailResult.error,
            );
            return NextResponse.json(
                { error: 'Failed to send email' },
                { status: 500 },
            );
        }

        // Log audit
        await logAudit({
            userId: user.id,
            action: 'PASSWORD_RESET_REQUESTED',
            ipAddress: ipAddress || null,
            metadata: { email },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Password reset link sent. Please check your email.',
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 },
        );
    }
}
