'use client';

import { useSession } from 'next-auth/react';
import { WordsGuestStub } from '@/components/words/WordsGuestStub';
import { WordsPageContent } from '@/components/words/WordsPageContent';

export default function WordsPage() {
    const { status } = useSession();

    if (status === 'loading') {
        return null;
    }

    if (status === 'unauthenticated') {
        return <WordsGuestStub />;
    }

    return <WordsPageContent />;
}
