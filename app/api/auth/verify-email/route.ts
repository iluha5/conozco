import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyEmailToken, deleteEmailVerificationToken } from '@/lib/tokens';
import { sendWelcomeEmail } from '@/lib/email';
import { logAudit } from '@/lib/audit';
import { getIpAddress } from '@/lib/ip-utils';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 },
            );
        }

        // Verify token
        const verification = await verifyEmailToken(token);

        if (!verification.valid) {
            return NextResponse.json(
                { error: verification.error || 'Invalid token' },
                { status: 400 },
            );
        }

        const email = verification.email!;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 },
            );
        }

        // Check if already verified
        if (user.emailVerified) {
            return NextResponse.json(
                { message: 'Email already verified' },
                { status: 200 },
            );
        }

        // Update user as verified
        await prisma.user.update({
            where: { email },
            data: {
                emailVerified: new Date(),
            },
        });

        // Delete verification token
        await deleteEmailVerificationToken(email);

        // Send welcome email (don't wait for it)
        sendWelcomeEmail(email).catch(error => {
            console.error('Failed to send welcome email:', error);
        });

        // Log audit
        const ipAddress = getIpAddress(request);
        await logAudit({
            userId: user.id,
            action: 'EMAIL_VERIFIED',
            ipAddress: ipAddress || null,
            metadata: { email },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Email verified successfully',
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 500 },
        );
    }
}
