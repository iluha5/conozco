import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminRegisterForm } from '@/components/auth/AdminRegisterForm';

export default async function RegisterPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/auth/login?callbackUrl=/auth/register');
    }

    if (session.user.role !== 'ADMIN') {
        redirect('/');
    }

    return <AdminRegisterForm />;
}
