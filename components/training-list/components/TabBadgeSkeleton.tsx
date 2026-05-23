'use client';

import { cn } from '@/lib/utils';

interface TabBadgeSkeletonProps {
    className?: string;
}

export function TabBadgeSkeleton({ className }: TabBadgeSkeletonProps) {
    return (
        <div
            className={cn(
                'h-5 w-8 animate-pulse rounded-full bg-gray-200',
                className,
            )}
        />
    );
}
