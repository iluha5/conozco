'use client';

import { Check, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useActiveWordGroups } from '@/hooks/word-groups/use-active-word-groups';

interface WordGroupsFilterProps {
    selectedGroupIds: number[];
    onToggleGroup: (_groupId: number) => void;
    onToggleAll: (_groupIds: number[]) => void;
    className?: string;
}

export function WordGroupsFilter({
    selectedGroupIds,
    onToggleGroup,
    onToggleAll,
    className,
}: WordGroupsFilterProps) {
    const { data: activeGroups, isLoading } = useActiveWordGroups();

    if (isLoading || !activeGroups || activeGroups.length === 0) {
        return null;
    }

    const allSelected = selectedGroupIds.length === activeGroups.length;
    const selectedCount = selectedGroupIds.length;
    const hasSelection = selectedGroupIds.length > 0;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn('h-9 border-dashed', className)}
                >
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Группы</span>
                    {hasSelection && (
                        <>
                            <Separator
                                orientation="vertical"
                                className="mx-2 h-4"
                            />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal"
                            >
                                {selectedCount}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
                <div className="p-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start font-normal"
                        onClick={() => onToggleAll(activeGroups.map(g => g.id))}
                    >
                        {allSelected ? 'Снять все' : 'Выбрать все'}
                    </Button>
                    <Separator className="my-2" />
                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                        {activeGroups.map(group => {
                            const isSelected = selectedGroupIds.includes(
                                group.id,
                            );
                            return (
                                <button
                                    key={group.id}
                                    onClick={() => onToggleGroup(group.id)}
                                    className={cn(
                                        'w-full flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-accent',
                                        isSelected && 'bg-accent',
                                    )}
                                >
                                    <span className="text-sm flex-1 text-left truncate">
                                        {group.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {group.wordsCount}
                                        </span>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
