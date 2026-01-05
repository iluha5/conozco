'use client';

import { cn } from '@/lib/utils';

interface TabBadgeSkeletonProps {
    className?: string;
}

/**
 * Скелетон для бейджа счетчика в табах
 * Используется во время загрузки данных счетчиков
 */
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

