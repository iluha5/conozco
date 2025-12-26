'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrainingModeGroupId } from '../types/typing';

interface TrainingTabsProps {
    activeTab: TrainingModeGroupId;
    onTabChange: (value: string) => void;
    notLearnedCount: number;
    learnedCount: number;
    children: {
        new: React.ReactNode;
        learned: React.ReactNode;
    };
}

/**
 * Минималистичный дизайн табов с подчеркиванием
 * Особенности:
 * - Чистый минималистичный стиль
 * - Акцент через подчеркивание активного таба
 * - Тонкие тени и плавные переходы
 */
export function TrainingTabs({
    activeTab,
    onTabChange,
    notLearnedCount,
    learnedCount,
    children,
}: TrainingTabsProps) {
    return (
        <Tabs
            value={activeTab}
            onValueChange={onTabChange}
            className="w-full"
        >
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 h-auto bg-transparent p-0 gap-1 border-b-2 border-gray-200">
                <TabsTrigger
                    value="new"
                    className={cn(
                        'relative rounded-t-lg px-6 py-4 text-base font-medium transition-all duration-200',
                        'data-[state=active]:text-purple-700 data-[state=active]:bg-transparent',
                        'data-[state=active]:border-b-4 data-[state=active]:border-purple-600',
                        'data-[state=active]:shadow-none',
                        'data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700',
                        'data-[state=inactive]:hover:bg-gray-50',
                        'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
                        'data-[state=active]:after:bg-purple-600',
                    )}
                >
                    <span className="flex items-center gap-2.5">
                        Новые слова
                        <Badge
                            className={cn(
                                'px-2.5 py-0.5 text-xs font-semibold rounded-full transition-all duration-200 pointer-events-none',
                                'focus:text-inherit focus:bg-inherit focus:border-inherit',
                                'active:text-inherit active:bg-inherit active:border-inherit',
                                activeTab === 'new'
                                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200',
                            )}
                        >
                            {notLearnedCount}
                        </Badge>
                    </span>
                </TabsTrigger>
                <TabsTrigger
                    value="learned"
                    className={cn(
                        'relative rounded-t-lg px-6 py-4 text-base font-medium transition-all duration-200',
                        'data-[state=active]:text-pink-700 data-[state=active]:bg-transparent',
                        'data-[state=active]:border-b-4 data-[state=active]:border-pink-600',
                        'data-[state=active]:shadow-none',
                        'data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700',
                        'data-[state=inactive]:hover:bg-gray-50',
                        'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5',
                        'data-[state=active]:after:bg-pink-600',
                    )}
                >
                    <span className="flex items-center gap-2.5">
                        Закрепление
                        <Badge
                            className={cn(
                                'px-2.5 py-0.5 text-xs font-semibold rounded-full transition-all duration-200 pointer-events-none',
                                'focus:text-inherit focus:bg-inherit focus:border-inherit',
                                'active:text-inherit active:bg-inherit active:border-inherit',
                                activeTab === 'learned'
                                    ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200',
                            )}
                        >
                            {learnedCount}
                        </Badge>
                    </span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="animate-fade-in">
                {children.new}
            </TabsContent>

            <TabsContent value="learned" className="animate-fade-in">
                {children.learned}
            </TabsContent>
        </Tabs>
    );
}
