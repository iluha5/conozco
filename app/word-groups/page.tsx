'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, X, Crown } from 'lucide-react';
import { Header } from '@/components/Header';
import {
    useActiveWordGroups,
    useAvailableWordGroups,
    useActivateWordGroup,
    useDeactivateWordGroup,
} from '@/hooks/word-groups/use-active-word-groups';
import { toast } from 'sonner';

// Объединенный тип группы для отображения
type CombinedWordGroup = {
    id: number;
    name: string;
    wordsCount: number;
    visibility: 'PUBLIC' | 'PRIVATE' | 'SHARED';
    createdBy: string;
    isActive: boolean;
    isOwner: boolean;
    canRemove: boolean;
};

export default function WordGroupsManagementPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingGroups, setLoadingGroups] = useState<Set<number>>(new Set());
    const [optimisticActiveGroups, setOptimisticActiveGroups] = useState<
        Set<number>
    >(new Set());

    // Фильтры
    const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');
    const [activityFilter, setActivityFilter] = useState<string>('ALL');

    const { data: activeGroups, isLoading: loadingActive } =
        useActiveWordGroups();
    const { data: availableGroups, isLoading: loadingAvailable } =
        useAvailableWordGroups();

    const activateMutation = useActivateWordGroup();
    const deactivateMutation = useDeactivateWordGroup();

    // Синхронизируем оптимистичное состояние с реальными данными
    useMemo(() => {
        if (activeGroups) {
            setOptimisticActiveGroups(new Set(activeGroups.map(g => g.id)));
        }
    }, [activeGroups]);

    // Объединяем активные и доступные группы в один список
    const combinedGroups = useMemo<CombinedWordGroup[]>(() => {
        const groups: CombinedWordGroup[] = [];

        // Добавляем активные группы
        if (activeGroups) {
            activeGroups.forEach(group => {
                groups.push({
                    id: group.id,
                    name: group.name,
                    wordsCount: group.wordsCount,
                    visibility: group.visibility,
                    createdBy: 'Вы', // Для активных групп не показываем создателя
                    isActive: true,
                    isOwner: group.isOwner,
                    canRemove: group.canRemove,
                });
            });
        }

        // Добавляем доступные группы (если они не активны)
        if (availableGroups) {
            const activeIds = new Set(activeGroups?.map(g => g.id) || []);
            availableGroups.forEach(group => {
                if (!activeIds.has(group.id)) {
                    groups.push({
                        id: group.id,
                        name: group.name,
                        wordsCount: group.wordsCount,
                        visibility: group.visibility,
                        createdBy: group.createdBy,
                        isActive: false,
                        isOwner: group.isOwner,
                        canRemove: false,
                    });
                }
            });
        }

        return groups.sort((a, b) => a.name.localeCompare(b.name));
    }, [activeGroups, availableGroups]);

    const handleToggleGroup = async (
        groupId: number,
        groupName: string,
        currentlyActive: boolean,
    ) => {
        // Оптимистичное обновление состояния
        setOptimisticActiveGroups(prev => {
            const newSet = new Set(prev);
            if (currentlyActive) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });

        // Устанавливаем состояние загрузки
        setLoadingGroups(prev => new Set(prev).add(groupId));

        try {
            if (currentlyActive) {
                await deactivateMutation.mutateAsync(groupId);
                toast.success(`Группа "${groupName}" удалена`);
            } else {
                await activateMutation.mutateAsync(groupId);
                toast.success(`Группа "${groupName}" добавлена`);
            }
        } catch (error) {
            // Откат оптимистичного обновления в случае ошибки
            setOptimisticActiveGroups(prev => {
                const newSet = new Set(prev);
                if (currentlyActive) {
                    newSet.add(groupId);
                } else {
                    newSet.delete(groupId);
                }
                return newSet;
            });
            toast.error(
                error instanceof Error
                    ? error.message
                    : currentlyActive
                      ? 'Ошибка при удалении группы'
                      : 'Ошибка при добавлении группы',
            );
        } finally {
            // Убираем состояние загрузки
            setLoadingGroups(prev => {
                const newSet = new Set(prev);
                newSet.delete(groupId);
                return newSet;
            });
        }
    };

    // Фильтруем объединенный список по поисковому запросу и фильтрам
    const filteredGroups = combinedGroups.filter(group => {
        // Поисковый запрос
        const matchesSearch = group.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        // Фильтр по типу доступа
        const matchesVisibility =
            visibilityFilter === 'ALL' || group.visibility === visibilityFilter;

        // Фильтр по активности
        const matchesActivity =
            activityFilter === 'ALL' ||
            (activityFilter === 'ACTIVE' && group.isActive) ||
            (activityFilter === 'INACTIVE' && !group.isActive);

        return matchesSearch && matchesVisibility && matchesActivity;
    });

    const getVisibilityText = (visibility: 'PUBLIC' | 'PRIVATE' | 'SHARED') => {
        switch (visibility) {
            case 'PUBLIC':
                return 'Публичная';
            case 'PRIVATE':
                return 'Личная';
            case 'SHARED':
                return 'Общая';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <div className="container mx-auto px-4 py-4">
                <div className="max-w-4xl mx-auto">
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                Управление группами слов
                            </CardTitle>
                            <p className="hidden sm:block text-sm text-muted-foreground mt-2">
                                Добавляйте или удаляйте группы слов для
                                фильтрации
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Поле поиска */}
                            <div className="relative">
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

                            {/* Фильтры и счетчик */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <Select
                                        value={visibilityFilter}
                                        onValueChange={setVisibilityFilter}
                                    >
                                        <SelectTrigger className="w-[140px] bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">
                                                Все типы
                                            </SelectItem>
                                            <SelectItem value="PUBLIC">
                                                Публичные
                                            </SelectItem>
                                            <SelectItem value="PRIVATE">
                                                Приватные
                                            </SelectItem>
                                            <SelectItem value="SHARED">
                                                Общие
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={activityFilter}
                                        onValueChange={setActivityFilter}
                                    >
                                        <SelectTrigger className="w-[140px] bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">
                                                Все группы
                                            </SelectItem>
                                            <SelectItem value="ACTIVE">
                                                Активные
                                            </SelectItem>
                                            <SelectItem value="INACTIVE">
                                                Неактивные
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Кнопка сброса фильтров */}
                                    {(visibilityFilter !== 'ALL' ||
                                        activityFilter !== 'ALL' ||
                                        searchQuery) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setVisibilityFilter('ALL');
                                                setActivityFilter('ALL');
                                                setSearchQuery('');
                                            }}
                                            className="px-2"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="text-sm text-gray-600 sm:ml-auto">
                                    Показано:{' '}
                                    <span className="font-semibold text-gray-900">
                                        {filteredGroups.length}
                                    </span>
                                </div>
                            </div>

                            {/* Список групп */}
                            {loadingActive || loadingAvailable ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : filteredGroups.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 max-h-[400px] overflow-y-auto">
                                    {filteredGroups.map(group => {
                                        const isLoading = loadingGroups.has(
                                            group.id,
                                        );
                                        const isOptimisticallyActive =
                                            optimisticActiveGroups.has(
                                                group.id,
                                            );
                                        const isCurrentlyActive =
                                            isOptimisticallyActive !== undefined
                                                ? isOptimisticallyActive
                                                : group.isActive;

                                        return (
                                            <Card
                                                key={group.id}
                                                className={`transition-all cursor-pointer hover:bg-gray-50 m-1 ${
                                                    isCurrentlyActive
                                                        ? 'ring-2 ring-black'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    !isLoading &&
                                                    handleToggleGroup(
                                                        group.id,
                                                        group.name,
                                                        isCurrentlyActive,
                                                    )
                                                }
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                {isLoading ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                                ) : (
                                                                    <Checkbox
                                                                        checked={
                                                                            isCurrentlyActive
                                                                        }
                                                                        onChange={() => {}}
                                                                        className="shrink-0"
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium truncate">
                                                                    {group.name}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <span>
                                                                        {
                                                                            group.wordsCount
                                                                        }{' '}
                                                                        слов
                                                                    </span>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-xs"
                                                                    >
                                                                        {getVisibilityText(
                                                                            group.visibility,
                                                                        )}
                                                                    </Badge>
                                                                    {group.isOwner && (
                                                                        <Crown className="w-3 h-3 text-amber-500" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">
                                        {searchQuery
                                            ? 'Группы не найдены'
                                            : 'Нет доступных групп'}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
