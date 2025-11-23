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

    // Проверить, что пользователь не создатель
    const group = await prisma.wordGroup.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.createdByUserId === userId) {
        return NextResponse.json(
            { error: 'Cannot remove your own group from active groups' },
            { status: 403 },
        );
    }

    // Удалить из активных
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
