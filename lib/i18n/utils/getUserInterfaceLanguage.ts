import 'server-only';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getUserInterfaceLanguage(): Promise<string | null> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return null;
        }

        const userId = parseInt(session.user.id);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                interfaceLanguage: {
                    select: { code: true },
                },
            },
        });

        return user?.interfaceLanguage?.code || null;
    } catch (error) {
        console.error('Error fetching user interface language:', error);
        return null;
    }
}
