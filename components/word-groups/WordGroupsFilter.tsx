'use client';

import { Check, Filter, MinusSquare, Square, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useActiveWordGroups } from '@/hooks/word-groups/use-active-word-groups';
import { useState, useEffect, useRef } from 'react';

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
    const [isOpen, setIsOpen] = useState(false);
    const [popupPosition, setPopupPosition] = useState({
        left: true,
        top: true,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const { data: activeGroups, isLoading } = useActiveWordGroups();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && containerRef.current && popupRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const popupRect = popupRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Проверяем горизонтальное позиционирование
            const fitsLeft =
                containerRect.left + popupRect.width <= viewportWidth;
            const fitsRight = containerRect.right - popupRect.width >= 0;

            // Проверяем вертикальное позиционирование
            const fitsDown =
                containerRect.bottom + popupRect.height <= viewportHeight;
            const fitsUp = containerRect.top - popupRect.height >= 0;

            setPopupPosition({
                left: fitsLeft || !fitsRight, // Используем left если помещается слева или не помещается справа
                top: fitsDown || !fitsUp, // Используем top если помещается снизу или не помещается сверху
            });
        }
    }, [isOpen]);

    if (isLoading || !activeGroups || activeGroups.length === 0) {
        return null;
    }

    const allSelected = selectedGroupIds.length === activeGroups.length;
    const selectedCount = selectedGroupIds.length;
    const hasSelection = selectedGroupIds.length > 0;

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="outline"
                size="sm"
                className={cn('h-9 border-dashed', className)}
                onClick={() => setIsOpen(!isOpen)}
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

            {isOpen && (
                <div
                    ref={popupRef}
                    className={cn(
                        'absolute z-50 w-[280px] rounded-md border bg-popover p-0 shadow-md',
                        popupPosition.top
                            ? 'top-full mt-1'
                            : 'bottom-full mb-1',
                        popupPosition.left ? 'left-0' : 'right-0',
                    )}
                    style={{
                        boxShadow:
                            '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    }}
                >
                    <div className="p-2 flex flex-col max-h-[400px]">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start font-normal flex-shrink-0"
                            onClick={() => {
                                if (allSelected) {
                                    onToggleAll([]);
                                } else {
                                    onToggleAll(activeGroups.map(g => g.id));
                                }
                            }}
                        >
                            {(() => {
                                if (selectedGroupIds.length === 0) {
                                    return <Square className="mr-2 h-4 w-4" />;
                                } else if (allSelected) {
                                    return (
                                        <CheckSquare className="mr-2 h-4 w-4" />
                                    );
                                } else {
                                    return (
                                        <MinusSquare className="mr-2 h-4 w-4" />
                                    );
                                }
                            })()}
                            {allSelected ? 'Снять все' : 'Выбрать все'}
                        </Button>
                        <Separator className="my-2 flex-shrink-0" />
                        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                            <div className="space-y-1 pr-2">
                                {activeGroups.map(group => {
                                    const isSelected =
                                        selectedGroupIds.includes(group.id);
                                    return (
                                        <button
                                            key={group.id}
                                            onClick={() =>
                                                onToggleGroup(group.id)
                                            }
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
                    </div>
                </div>
            )}
        </div>
    );
}
