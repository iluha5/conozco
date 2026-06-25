'use client';

import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';

const LandingContent = dynamic(
    () =>
        import('@/components/landing/LandingContent').then(module => ({
            default: module.LandingContent,
        })),
    {
        loading: function LandingContentLoading() {
            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
            );
        },
    },
);

const ScrollToTop = dynamic(
    () =>
        import('@/components/landing/ScrollToTop').then(module => ({
            default: module.ScrollToTop,
        })),
    { ssr: false },
);

export default function HomePage() {
    return (
        <>
            <Header />
            <LandingContent />
            <ScrollToTop />
        </>
    );
}
