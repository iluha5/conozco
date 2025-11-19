import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SavedTrainingState } from '@/types/training.types';

/**
 * POST /api/training-logs
 * Сохранить лог завершенной тренировки
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 },
            );
        }

        const body = await request.json();
        const { savedState } = body as { savedState: SavedTrainingState };

        if (!savedState) {
            return NextResponse.json(
                { error: 'Missing savedState' },
                { status: 400 },
            );
        }

        // Вычисляем статистику
        const totalAttempts = savedState.stagesProgress.reduce(
            (sum, sp) =>
                sum + sp.wordsProgress.reduce((s, wp) => s + wp.attempts, 0),
            0,
        );

        const correctAttempts = savedState.stagesProgress.reduce(
            (sum, sp) =>
                sum +
                sp.wordsProgress.reduce((s, wp) => s + wp.correctAttempts, 0),
            0,
        );

        const accuracy =
            totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

        // Вычисляем длительность в секундах
        const startedAt = new Date(savedState.startedAt);
        const completedAt = new Date();
        const duration = Math.floor(
            (completedAt.getTime() - startedAt.getTime()) / 1000,
        );

        // Сохраняем в БД
        const trainingLog = await prisma.trainingLog.create({
            data: {
                userId: user.id,
                sessionId: savedState.sessionId,
                selectedLanguage: savedState.selectedLanguage,
                totalWords: savedState.totalWords,
                completedWords: savedState.completedWords,
                totalAttempts,
                correctAttempts,
                accuracy,
                duration,
                enabledStages: JSON.stringify(savedState.enabledStages),
                stagesProgress: JSON.stringify(savedState.stagesProgress),
                startedAt,
                completedAt,
            },
        });

        return NextResponse.json(trainingLog);
    } catch (error) {
        console.error('Error saving training log:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}

/**
 * GET /api/training-logs
 * Получить историю тренировок пользователя
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 },
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const logs = await prisma.trainingLog.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error fetching training logs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
