import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - получение настроек пользователя
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                ownLanguageId: true,
                learnLanguageId: true,
                interfaceLanguageId: true,
                hasConfigured: true,
                ownLanguage: {
                    select: { id: true, code: true, name: true },
                },
                learnLanguage: {
                    select: { id: true, code: true, name: true },
                },
                interfaceLanguage: {
                    select: { id: true, code: true, name: true },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 },
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}

// PATCH - обновление настроек пользователя
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);
        const body = await request.json();

        const {
            name,
            ownLanguageId,
            learnLanguageId,
            interfaceLanguageId,
            hasConfigured,
        } = body;

        // Валидация данных
        const updates: any = {};

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return NextResponse.json(
                    { error: 'Invalid name' },
                    { status: 400 },
                );
            }
            updates.name = name.trim();
        }

        if (ownLanguageId !== undefined) {
            if (ownLanguageId !== null && typeof ownLanguageId !== 'number') {
                return NextResponse.json(
                    { error: 'Invalid ownLanguageId' },
                    { status: 400 },
                );
            }
            updates.ownLanguageId = ownLanguageId;
        }

        if (learnLanguageId !== undefined) {
            if (
                learnLanguageId !== null &&
                typeof learnLanguageId !== 'number'
            ) {
                return NextResponse.json(
                    { error: 'Invalid learnLanguageId' },
                    { status: 400 },
                );
            }
            updates.learnLanguageId = learnLanguageId;
        }

        if (interfaceLanguageId !== undefined) {
            if (
                interfaceLanguageId !== null &&
                typeof interfaceLanguageId !== 'number'
            ) {
                return NextResponse.json(
                    { error: 'Invalid interfaceLanguageId' },
                    { status: 400 },
                );
            }
            updates.interfaceLanguageId = interfaceLanguageId;
        }

        if (hasConfigured !== undefined) {
            if (typeof hasConfigured !== 'boolean') {
                return NextResponse.json(
                    { error: 'Invalid hasConfigured' },
                    { status: 400 },
                );
            }
            updates.hasConfigured = hasConfigured;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updates,
            select: {
                id: true,
                email: true,
                name: true,
                ownLanguageId: true,
                learnLanguageId: true,
                interfaceLanguageId: true,
                hasConfigured: true,
                ownLanguage: {
                    select: { id: true, code: true, name: true },
                },
                learnLanguage: {
                    select: { id: true, code: true, name: true },
                },
                interfaceLanguage: {
                    select: { id: true, code: true, name: true },
                },
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
