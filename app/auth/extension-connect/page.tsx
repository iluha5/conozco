import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ExtensionConnectPanel } from '@/components/auth/ExtensionConnectPanel';

export default async function ExtensionConnectPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/auth/login?callbackUrl=/auth/extension-connect');
    }

    return <ExtensionConnectPanel userEmail={session.user.email} />;
}
