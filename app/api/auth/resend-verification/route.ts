import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIpAddress } from '@/lib/ip-utils';
import { checkAndLogRateLimit } from '@/lib/rate-limit';
import { sanitizeEmail, isValidEmail } from '@/lib/validation';
import { createEmailVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';
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

        // Check rate limit (more strict for resend)
        const rateLimit = await checkAndLogRateLimit({
            email,
            ipAddress: ipAddress || undefined,
            action: 'RESEND',
            limitMinutes: 60,
            maxAttempts: 3,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many resend attempts',
                    retryAfter: rateLimit.remainingSeconds,
                },
                { status: 429 },
            );
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, emailVerified: true },
        });

        // IMPORTANT: Don't reveal if user exists or not (for security)
        if (!user) {
            return NextResponse.json(
                {
                    success: true,
                    message:
                        'If the email exists, a verification link has been sent.',
                },
                { status: 200 },
            );
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json(
                { error: 'Email already verified' },
                { status: 400 },
            );
        }

        // Create new verification token
        const token = await createEmailVerificationToken(email);

        // Send verification email
        const emailResult = await sendVerificationEmail(email, token);

        if (!emailResult.success) {
            console.error(
                'Failed to send verification email:',
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
            action: 'VERIFICATION_RESENT',
            ipAddress: ipAddress || null,
            metadata: { email },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Verification email sent. Please check your inbox.',
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Resend verification error:', error);
        return NextResponse.json(
            { error: 'Failed to resend verification' },
            { status: 500 },
        );
    }
}
