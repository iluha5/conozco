'use client';

import { useMemo } from 'react';
import { Tabs, TabsList, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { TrainingModeGroupId } from '../types/typing';
import { getTabsConfig } from '../constants/tabs-config';
import { TabTriggerWithBadge } from './TabTriggerWithBadge';
import { Word } from '@/types/training.types';
import { useTranslation } from '@/lib/i18n';

interface TrainingTabsProps {
    activeTab: TrainingModeGroupId;
    onTabChange: (_value: string) => void;
    words?: Word[];
    isLoading?: boolean;
    children: Record<TrainingModeGroupId, React.ReactNode>;
}

export function TrainingTabs({
    activeTab,
    onTabChange,
    words,
    isLoading,
    children,
}: TrainingTabsProps) {
    const { t } = useTranslation();
    const tabsConfig = useMemo(() => getTabsConfig(t), [t]);

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList
                className={cn(
                    'max-w-2xl mx-auto mb-8 h-auto bg-transparent p-0 gap-0.5 sm:gap-1',
                    'border-b-2 border-gray-200',
                    'overflow-x-auto scroll-px-4 px-1',
                    'max-sm:flex max-sm:flex-nowrap max-sm:w-full',
                    'sm:grid sm:w-full sm:grid-cols-3 sm:gap-1',
                )}
            >
                {tabsConfig.map(tabConfig => {
                    const badgeCount =
                        tabConfig.getBadgeCount && words
                            ? tabConfig.getBadgeCount(words)
                            : undefined;

                    return (
                        <TabTriggerWithBadge
                            key={tabConfig.id}
                            config={tabConfig}
                            isActive={activeTab === tabConfig.id}
                            badgeCount={badgeCount}
                            isLoading={isLoading}
                        />
                    );
                })}
            </TabsList>

            {tabsConfig.map(tabConfig => (
                <TabsContent
                    key={tabConfig.id}
                    value={tabConfig.id}
                    className="animate-fade-in"
                >
                    {children[tabConfig.id]}
                </TabsContent>
            ))}
        </Tabs>
    );
}
