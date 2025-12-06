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
// removed unused Select imports after UI refactor
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { Plus, Minus, Loader2, Search, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
                className="sm:max-w-[500px] max-h-[90dvh] flex flex-col"
                onOpenAutoFocus={e => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Настройка проверки по группам</DialogTitle>
                    <DialogDescription>
                        Выберите группу слов и количество слов для проверки
                    </DialogDescription>
                </DialogHeader>

                {/* Центральная зона, которая подстраивается по высоте */}
                <div className="space-y-6 py-4 flex-1 min-h-0 flex flex-col">
                    {/* Выбор группы (как на странице Управление группами, без фильтров) */}
                    <div className="space-y-3 flex-1 min-h-0 flex flex-col">
                        {/* Поле поиска с иконкой + счетчик в одной строке */}
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Поиск групп..."
                                    value={searchQuery}
                                    onChange={e =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                            <Badge variant="outline" className="shrink-0">
                                {filteredGroups.length + 1}
                            </Badge>
                        </div>

                        {/* Список групп */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : (
                            // Делаем только список адаптивным и прокручиваемым
                            <div className="grid grid-cols-1 gap-1 flex-1 min-h-0 overflow-y-auto">
                                {/* Все группы */}
                                <Card
                                    key="all"
                                    className={`transition-all hover:bg-gray-50 m-1 ${
                                        selectedGroupId === 'all'
                                            ? 'ring-2 ring-black'
                                            : ''
                                    }`}
                                    onClick={() => setSelectedGroupId('all')}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">
                                                    Все группы
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Разные типы
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {filteredGroups.map(group => (
                                    <Card
                                        key={group.id}
                                        className={`transition-all hover:bg-gray-50 m-1 ${
                                            selectedGroupId ===
                                            group.id.toString()
                                                ? 'ring-2 ring-black'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setSelectedGroupId(
                                                group.id.toString(),
                                            )
                                        }
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">
                                                        {group.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span>
                                                            {group.wordsCount}{' '}
                                                            слов
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {group.visibility ===
                                                            'PUBLIC'
                                                                ? 'Публичная'
                                                                : group.visibility ===
                                                                    'PRIVATE'
                                                                  ? 'Личная'
                                                                  : 'Общая'}
                                                        </Badge>
                                                        {group.isOwner && (
                                                            <Crown className="w-3 h-3 text-amber-500" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Информация о количестве слов в группе удалена по требованиям */}
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
