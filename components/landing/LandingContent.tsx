'use client';

import { useLandingLanguage } from './useLandingLanguage';
import { LandingContentRu } from './LandingContentRu';
import { LandingContentEn } from './LandingContentEn';
import { LandingContentEs } from './LandingContentEs';

interface LandingContentProps {
    variant?: 'variant2';
}

export function LandingContent({ variant = 'variant2' }: LandingContentProps) {
    const { language, isLoaded } = useLandingLanguage();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Loading...</div>
            </div>
        );
    }

    switch (language) {
        case 'ru':
            return <LandingContentRu variant={variant} />;
        case 'en':
            return <LandingContentEn variant={variant} />;
        case 'es':
            return <LandingContentEs variant={variant} />;
        default:
            return <LandingContentRu variant={variant} />;
    }
}
