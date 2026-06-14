'use client';

import { useSession } from 'next-auth/react';

export function useIsGuest(): boolean {
    const { status } = useSession();

    return status === 'unauthenticated';
}
