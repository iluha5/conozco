import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    CookieConsentRequest,
    CookieConsentResponse,
    CookiePreferences,
} from '@/types/cookie-consent.types';

/**
 * GET /api/user/cookie-consent
 * Получить текущее согласие пользователя
 */
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

        const consent = await prisma.userCookieConsent.findUnique({
            where: { userId },
        });

        if (!consent) {
            return NextResponse.json(null);
        }

        const response: CookieConsentResponse = {
            id: consent.id,
            userId: consent.userId,
            version: consent.version,
            given: consent.given,
            givenAt: consent.givenAt?.toISOString() || null,
            withdrawnAt: consent.withdrawnAt?.toISOString() || null,
            preferences: consent.preferences as unknown as CookiePreferences,
            createdAt: consent.createdAt.toISOString(),
            updatedAt: consent.updatedAt.toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching cookie consent:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * POST /api/user/cookie-consent
 * Создать или обновить согласие пользователя
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);
        const body: CookieConsentRequest = await request.json();

        // Валидация
        if (!body.version || typeof body.given !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 },
            );
        }

        if (!body.preferences || typeof body.preferences !== 'object') {
            return NextResponse.json(
                { error: 'Preferences are required' },
                { status: 400 },
            );
        }

        // necessary всегда должен быть true
        const preferences = {
            ...body.preferences,
            necessary: true,
        };

        // Upsert согласия
        const consent = await prisma.userCookieConsent.upsert({
            where: { userId },
            update: {
                version: body.version,
                given: body.given,
                givenAt: body.given ? new Date() : null,
                withdrawnAt: body.given ? null : new Date(),
                preferences,
                updatedAt: new Date(),
            },
            create: {
                userId,
                version: body.version,
                given: body.given,
                givenAt: body.given ? new Date() : null,
                withdrawnAt: body.given ? null : new Date(), // При отказе сохраняем текущую дату
                preferences,
            },
        });

        const response: CookieConsentResponse = {
            id: consent.id,
            userId: consent.userId,
            version: consent.version,
            given: consent.given,
            givenAt: consent.givenAt?.toISOString() || null,
            withdrawnAt: consent.withdrawnAt?.toISOString() || null,
            preferences: consent.preferences as unknown as CookiePreferences,
            createdAt: consent.createdAt.toISOString(),
            updatedAt: consent.updatedAt.toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error saving cookie consent:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * DELETE /api/user/cookie-consent
 * Отозвать согласие пользователя
 */
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const userId = parseInt(session.user.id);

        const consent = await prisma.userCookieConsent.findUnique({
            where: { userId },
        });

        if (!consent) {
            return NextResponse.json(
                { error: 'Consent not found' },
                { status: 404 },
            );
        }

        const updatedConsent = await prisma.userCookieConsent.update({
            where: { userId },
            data: {
                given: false,
                withdrawnAt: new Date(),
                updatedAt: new Date(),
            },
        });

        const response: CookieConsentResponse = {
            id: updatedConsent.id,
            userId: updatedConsent.userId,
            version: updatedConsent.version,
            given: updatedConsent.given,
            givenAt: updatedConsent.givenAt?.toISOString() || null,
            withdrawnAt: updatedConsent.withdrawnAt?.toISOString() || null,
            preferences: updatedConsent.preferences as any,
            createdAt: updatedConsent.createdAt.toISOString(),
            updatedAt: updatedConsent.updatedAt.toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error withdrawing cookie consent:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
