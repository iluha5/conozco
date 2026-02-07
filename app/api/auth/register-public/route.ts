import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getIpAddress } from '@/lib/ip-utils';
import { checkAndLogRateLimit } from '@/lib/rate-limit';
import {
    sanitizeEmail,
    isValidEmail,
    isValidPassword,
    getPasswordErrors,
} from '@/lib/validation';
import { createEmailVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email: rawEmail, password, name } = body;

        // Validate input
        if (!rawEmail || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
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

        // Validate password strength
        if (!isValidPassword(password)) {
            const errors = getPasswordErrors(password);
            return NextResponse.json(
                {
                    error: 'Password does not meet requirements',
                    details: errors,
                },
                { status: 400 },
            );
        }

        const ipAddress = getIpAddress(request);

        // Check rate limit
        const rateLimit = await checkAndLogRateLimit({
            email,
            ipAddress: ipAddress || undefined,
            action: 'REGISTER',
            limitMinutes: 60,
            maxAttempts: 3,
        });

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many registration attempts',
                    retryAfter: rateLimit.remainingSeconds,
                },
                { status: 429 },
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, emailVerified: true },
        });

        if (existingUser) {
            if (existingUser.emailVerified) {
                return NextResponse.json(
                    { error: 'User already exists' },
                    { status: 409 },
                );
            } else {
                // User exists but not verified - allow resend
                return NextResponse.json(
                    {
                        error: 'Email already registered but not verified',
                        requiresVerification: true,
                    },
                    { status: 409 },
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                registrationMethod: 'EMAIL_PASSWORD',
                emailVerified: null, // Will be set after email verification
            },
        });

        // Create verification token
        const token = await createEmailVerificationToken(email);

        // Send verification email
        const emailResult = await sendVerificationEmail(email, token);

        if (!emailResult.success) {
            // Log error but don't fail the registration
            console.error(
                'Failed to send verification email:',
                emailResult.error,
            );
        }

        // Log audit
        await logAudit({
            userId: user.id,
            action: 'USER_REGISTERED',
            ipAddress: ipAddress || null,
            metadata: { email, registrationMethod: 'EMAIL_PASSWORD' },
        });

        return NextResponse.json(
            {
                success: true,
                message:
                    'Registration successful. Please check your email to verify your account.',
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Registration failed' },
            { status: 500 },
        );
    }
}
