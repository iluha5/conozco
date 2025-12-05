'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { Plus, Minus } from 'lucide-react';
import { FlashCardsReviewParams } from '../typing';

interface AccessibleWordGroup {
    id: number;
    name: string;
    wordsCount: number;
    visibility: 'PUBLIC' | 'PRIVATE' | 'SHARED';
    createdBy: string;
    isOwner: boolean;
    isActive: boolean;
}

interface GroupReviewSetupDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
    onStart: (_params: FlashCardsReviewParams) => void;
}

const STORAGE_KEY = 'group-review-settings';

export function GroupReviewSetupDialog({
    open,
    onOpenChange,
    onStart,
}: GroupReviewSetupDialogProps) {
    const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
    const [wordCount, setWordCount] = useState(20);
    const [searchQuery, setSearchQuery] = useState('');

    // Загружаем все доступные группы
    const { data: groups = [], isLoading } = useQuery<AccessibleWordGroup[]>({
        queryKey: ['allAccessibleWordGroups'],
        queryFn: async () => {
            const res = await fetch('/api/user/word-groups/all-accessible');
            if (!res.ok) throw new Error('Failed to fetch groups');
            return res.json();
        },
        enabled: open,
    });

    // Загружаем сохраненные настройки
    useEffect(() => {
        if (open && typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.groupId) {
                        setSelectedGroupId(parsed.groupId);
                    }
                    if (parsed.wordCount) {
                        setWordCount(parsed.wordCount);
                    }
                } catch (e) {
                    console.error('Failed to parse saved settings', e);
                }
            }
        }
    }, [open]);

    // Фильтруем группы по поисковому запросу
    const filteredGroups = useMemo(() => {
        if (!searchQuery.trim()) return groups;
        const query = searchQuery.toLowerCase();
        return groups.filter(group => group.name.toLowerCase().includes(query));
    }, [groups, searchQuery]);

    const handleStart = () => {
        const params: FlashCardsReviewParams = {
            source: 'base',
            limit: wordCount,
            random: true,
            includeAllGroups: selectedGroupId === 'all',
            ...(selectedGroupId !== 'all' && {
                groupIds: [parseInt(selectedGroupId)],
            }),
            selectedGroupName:
                selectedGroupId === 'all'
                    ? 'Все группы'
                    : groups.find(g => g.id === parseInt(selectedGroupId))
                          ?.name,
        };

        // Сохраняем настройки
        if (typeof window !== 'undefined') {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    groupId: selectedGroupId,
                    wordCount,
                }),
            );
        }

        onStart(params);
        onOpenChange(false);
    };

    const handleIncreaseCount = () => {
        setWordCount(prev => Math.min(prev + 1, 50));
    };

    const handleDecreaseCount = () => {
        setWordCount(prev => Math.max(prev - 1, 5));
    };

    const selectedGroup = groups.find(g => g.id === parseInt(selectedGroupId));
    const maxWordsInGroup = selectedGroup?.wordsCount || 0;
    const showWarning =
        selectedGroupId !== 'all' &&
        wordCount > maxWordsInGroup &&
        maxWordsInGroup > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[500px]"
                onOpenAutoFocus={e => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Настройка проверки по группам</DialogTitle>
                    <DialogDescription>
                        Выберите группу слов и количество слов для проверки
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Выбор группы */}
                    <div className="space-y-2">
                        <Label htmlFor="group-select">Группа слов</Label>
                        <div className="space-y-2">
                            <Input
                                placeholder="Поиск группы..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="mb-2"
                            />
                            <Select
                                value={selectedGroupId}
                                onValueChange={setSelectedGroupId}
                            >
                                <SelectTrigger id="group-select">
                                    <SelectValue placeholder="Выберите группу" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Все группы
                                    </SelectItem>
                                    {filteredGroups.map(group => (
                                        <SelectItem
                                            key={group.id}
                                            value={group.id.toString()}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span>{group.name}</span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    ({group.wordsCount} слов)
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedGroup && (
                            <p className="text-sm text-gray-500">
                                В группе доступно {selectedGroup.wordsCount}{' '}
                                слов
                            </p>
                        )}
                        {showWarning && (
                            <p className="text-sm text-yellow-600">
                                В группе только {maxWordsInGroup} слов. Будет
                                использовано доступное количество.
                            </p>
                        )}
                    </div>

                    {/* Количество слов */}
                    <div className="space-y-2">
                        <Label>Количество слов</Label>
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleDecreaseCount}
                                disabled={wordCount <= 5}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <div className="flex-1 text-center">
                                <span className="text-2xl font-semibold">
                                    {wordCount}
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleIncreaseCount}
                                disabled={wordCount >= 50}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            Минимум: 5, Максимум: 50
                        </p>
                    </div>
                </div>

                <div className="flex flex-row justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Отмена
                    </Button>
                    <Button onClick={handleStart} disabled={isLoading}>
                        Начать проверку
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
