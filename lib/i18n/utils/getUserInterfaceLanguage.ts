import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Получает код языка интерфейса пользователя из БД
 * Возвращает код языка (ru, en, es) или null если пользователь не авторизован
 */
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







