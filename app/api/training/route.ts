import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { wordId, stage, isCorrect } = await request.json();

        if (!wordId || stage === undefined || isCorrect === undefined) {
            return NextResponse.json(
                { error: 'WordId, stage, and isCorrect are required' },
                { status: 400 },
            );
        }

        const session = await prisma.trainingSession.create({
            data: {
                wordId,
                stage,
                isCorrect,
            },
        });

        return NextResponse.json(session, { status: 201 });
    } catch (error) {
        console.error('Error creating training session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const wordId = searchParams.get('wordId');

        if (!wordId) {
            return NextResponse.json(
                { error: 'WordId is required' },
                { status: 400 },
            );
        }

        const sessions = await prisma.trainingSession.findMany({
            where: { wordId: parseInt(wordId) },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Calculate statistics by stages
        const stats = {
            stage1: { total: 0, correct: 0 },
            stage2: { total: 0, correct: 0 },
            stage3: { total: 0, correct: 0 },
            stage4: { total: 0, correct: 0 },
            stage5: { total: 0, correct: 0 },
            stage6: { total: 0, correct: 0 },
        };

        sessions.forEach(session => {
            const stageKey = `stage${session.stage}` as keyof typeof stats;
            stats[stageKey].total++;
            if (session.isCorrect) {
                stats[stageKey].correct++;
            }
        });

        return NextResponse.json({ sessions, stats });
    } catch (error) {
        console.error('Error fetching training stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
