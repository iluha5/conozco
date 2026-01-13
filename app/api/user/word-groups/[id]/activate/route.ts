import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    // Check that group is available to user
    const group = await prisma.wordGroup.findFirst({
        where: {
            id: groupId,
            OR: [
                { visibility: 'PUBLIC', isApproved: true },
                { visibility: 'SHARED', sharedWith: { some: { userId } } },
            ],
        },
    });

    if (!group) {
        return NextResponse.json(
            { error: 'Group not available' },
            { status: 404 },
        );
    }

    // Check that not already activated
    const existing = await prisma.userWordGroup.findUnique({
        where: {
            userId_wordGroupId: { userId, wordGroupId: groupId },
        },
    });

    if (existing) {
        return NextResponse.json(
            { error: 'Group already activated' },
            { status: 400 },
        );
    }

    // Activate
    await prisma.userWordGroup.create({
        data: { userId, wordGroupId: groupId },
    });

    return NextResponse.json({
        success: true,
        message: `Group "${group.name}" activated`,
    });
}
