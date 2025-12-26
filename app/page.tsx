'use client';

import { Header } from '@/components/Header';
import { LandingContent } from '@/components/landing/LandingContent';
import { ScrollToTop } from '@/components/landing/ScrollToTop';

export default function HomePage() {
    return (
        <>
            <Header />
            <LandingContent variant="variant2" />
            <ScrollToTop />
        </>
    );
}
