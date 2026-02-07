import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getIpAddress } from '@/lib/ip-utils';
import { isValidPassword, getPasswordErrors } from '@/lib/validation';
import {
    verifyPasswordResetToken,
    deletePasswordResetToken,
} from '@/lib/tokens';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
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

        // Verify token
        const verification = await verifyPasswordResetToken(token);

        if (!verification.valid) {
            return NextResponse.json(
                { error: verification.error || 'Invalid or expired token' },
                { status: 400 },
            );
        }

        const email = verification.email!;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, password: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 },
            );
        }

        // Check if user is OAuth-only (no password)
        if (!user.password) {
            return NextResponse.json(
                { error: 'Cannot reset password for OAuth-only accounts' },
                { status: 400 },
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password and set passwordChangedAt
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                passwordChangedAt: new Date(), // This will invalidate old JWT tokens
            },
        });

        // Delete password reset token
        await deletePasswordResetToken(email);

        // Log audit
        const ipAddress = getIpAddress(request);
        await logAudit({
            userId: user.id,
            action: 'PASSWORD_RESET',
            ipAddress: ipAddress || null,
            metadata: { email },
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Password reset successfully',
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 },
        );
    }
}
