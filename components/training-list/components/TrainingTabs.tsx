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
    words: Word[];
    children: Record<TrainingModeGroupId, React.ReactNode>;
}

/**
 * Минималистичный дизайн табов с подчеркиванием
 * Особенности:
 * - Чистый минималистичный стиль
 * - Акцент через подчеркивание активного таба
 * - Тонкие тени и плавные переходы
 * - Динамический рендеринг на основе конфигурации
 */
export function TrainingTabs({
    activeTab,
    onTabChange,
    words,
    children,
}: TrainingTabsProps) {
    const { t } = useTranslation();
    const tabsConfig = useMemo(() => getTabsConfig(t), [t]);

    return (
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList
                className={cn(
                    'grid w-full grid-cols-3 max-w-2xl mx-auto mb-8 h-auto bg-transparent p-0 gap-0.5 sm:gap-1',
                    'border-b-2 border-gray-200',
                    'overflow-x-auto',
                    // На очень маленьких экранах используем flex для горизонтального скролла
                    'max-[480px]:flex max-[480px]:flex-nowrap max-[480px]:grid-cols-none',
                )}
            >
                {tabsConfig.map(tabConfig => {
                    const badgeCount = tabConfig.getBadgeCount
                        ? tabConfig.getBadgeCount(words)
                        : undefined;

                    return (
                        <TabTriggerWithBadge
                            key={tabConfig.id}
                            config={tabConfig}
                            isActive={activeTab === tabConfig.id}
                            badgeCount={badgeCount}
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
