import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    // Check that user is not the creator
    const group = await prisma.wordGroup.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Remove from active
    await prisma.userWordGroup.delete({
        where: {
            userId_wordGroupId: { userId, wordGroupId: groupId },
        },
    });

    return NextResponse.json({
        success: true,
        message: `Group "${group.name}" deactivated`,
    });
}
