'use client';

import { TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TabConfig } from '../constants/tabs-config';
import { TabBadgeSkeleton } from './TabBadgeSkeleton';

interface TabTriggerWithBadgeProps {
    config: TabConfig;
    isActive: boolean;
    badgeCount?: number;
    isLoading?: boolean;
}

export function TabTriggerWithBadge({
    config,
    isActive,
    badgeCount,
    isLoading,
}: TabTriggerWithBadgeProps) {
    const { colorScheme, showBadge } = config;

    return (
        <TabsTrigger
            value={config.id}
            className={cn(
                'relative rounded-t-lg px-3 py-2 sm:px-6 sm:py-4 text-sm sm:text-base font-medium transition-all duration-200',
                isActive
                    ? [
                          colorScheme.active.text,
                          'bg-transparent',
                          'border-b-4',
                          colorScheme.active.border,
                          'shadow-none',
                      ]
                    : [
                          colorScheme.inactive.text,
                          colorScheme.inactive.hover.text,
                          colorScheme.inactive.hover.bg,
                      ],
                'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
                isActive && colorScheme.active.after,
            )}
        >
            <span className="flex items-center gap-2 sm:gap-2.5">
                {config.title}
                {showBadge && (
                    <>
                        {isLoading && badgeCount === undefined ? (
                            <TabBadgeSkeleton />
                        ) : (
                            badgeCount !== undefined && (
                                <Badge
                                    className={cn(
                                        'px-2 sm:px-2.5 py-0.5 text-xs font-semibold rounded-full transition-all duration-200 pointer-events-none',
                                        'focus:text-inherit focus:bg-inherit focus:border-inherit',
                                        'active:text-inherit active:bg-inherit active:border-inherit',
                                        'border',
                                        isActive
                                            ? [
                                                  colorScheme.badge.active.bg,
                                                  colorScheme.badge.active.text,
                                                  colorScheme.badge.active.border,
                                              ]
                                            : [
                                                  colorScheme.badge.inactive.bg,
                                                  colorScheme.badge.inactive.text,
                                                  colorScheme.badge.inactive.border,
                                              ],
                                    )}
                                >
                                    {badgeCount}
                                </Badge>
                            )
                        )}
                    </>
                )}
            </span>
        </TabsTrigger>
    );
}
