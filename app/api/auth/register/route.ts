import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { tServer } from '@/lib/i18n/utils/tServer';

// Admin password for registration - should be in env variable in production
const ADMIN_REGISTRATION_PASSWORD =
    process.env.ADMIN_REGISTRATION_PASSWORD || 'admin123';

export async function POST(request: NextRequest) {
    try {
        const { email, password, name, adminPassword } = await request.json();

        // Validate admin password
        if (adminPassword !== ADMIN_REGISTRATION_PASSWORD) {
            return NextResponse.json(
                { error: await tServer('Invalid admin password') },
                { status: 403 },
            );
        }

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: await tServer('Email and password are required') },
                { status: 400 },
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                {
                    error: await tServer(
                        'Password must be at least 6 characters',
                    ),
                },
                { status: 400 },
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: await tServer('User with this email already exists') },
                { status: 409 },
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const defaultRole = await prisma.userRole.findUnique({
            where: { code: 'USER' },
        });

        if (!defaultRole) {
            return NextResponse.json(
                { error: await tServer('Default user role is not configured') },
                { status: 500 },
            );
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                roleId: defaultRole.id,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        const { role, ...rest } = user as any;

        return NextResponse.json(
            {
                user: {
                    ...rest,
                    role: role.code,
                },
                message: await tServer('User created successfully'),
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: await tServer('Internal server error') },
            { status: 500 },
        );
    }
}
