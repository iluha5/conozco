'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus, X, Search, Users, Lock, Globe } from 'lucide-react';
import {
    useActiveWordGroups,
    useAvailableWordGroups,
    useActivateWordGroup,
    useDeactivateWordGroup,
} from '@/hooks/word-groups/use-active-word-groups';
import { toast } from 'sonner';

interface WordGroupsManagementDialogProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
}

export function WordGroupsManagementDialog({
    open,
    onOpenChange,
}: WordGroupsManagementDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: activeGroups, isLoading: loadingActive } =
        useActiveWordGroups();
    const { data: availableGroups, isLoading: loadingAvailable } =
        useAvailableWordGroups();

    const activateMutation = useActivateWordGroup();
    const deactivateMutation = useDeactivateWordGroup();

    const handleActivate = async (groupId: number, groupName: string) => {
        try {
            await activateMutation.mutateAsync(groupId);
            toast.success(`Группа "${groupName}" добавлена`);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Ошибка при добавлении группы',
            );
        }
    };

    const handleDeactivate = async (groupId: number, groupName: string) => {
        try {
            await deactivateMutation.mutateAsync(groupId);
            toast.success(`Группа "${groupName}" удалена`);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Ошибка при удалении группы',
            );
        }
    };

    const filteredAvailable = availableGroups?.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const getVisibilityIcon = (visibility: 'PUBLIC' | 'PRIVATE' | 'SHARED') => {
        switch (visibility) {
            case 'PUBLIC':
                return <Globe className="h-3 w-3" />;
            case 'PRIVATE':
                return <Lock className="h-3 w-3" />;
            case 'SHARED':
                return <Users className="h-3 w-3" />;
        }
    };

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[95vh] sm:max-h-[80vh] flex flex-col top-[2%] sm:top-[50%] translate-y-0 sm:translate-y-[-50%]">
                <DialogHeader>
                    <DialogTitle>Управление группами слов</DialogTitle>
                    <DialogDescription className="hidden sm:block">
                        Добавляйте или удаляйте группы слов для фильтрации
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                    {/* Активные группы */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium">
                            Мои активные группы ({activeGroups?.length || 0})
                        </h3>
                        {loadingActive ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : activeGroups && activeGroups.length > 0 ? (
                            <ScrollArea className="h-32 md:h-40">
                                <div className="flex flex-wrap gap-2">
                                    {activeGroups.map(group => (
                                        <Badge
                                            key={group.id}
                                            variant="secondary"
                                            className="flex items-center gap-2 pr-2"
                                        >
                                            <span className="flex items-center gap-1">
                                                {getVisibilityIcon(
                                                    group.visibility,
                                                )}
                                                <span>{group.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({group.wordsCount})
                                                </span>
                                            </span>
                                            {group.canRemove && (
                                                <button
                                                    onClick={() =>
                                                        handleDeactivate(
                                                            group.id,
                                                            group.name,
                                                        )
                                                    }
                                                    disabled={
                                                        deactivateMutation.isPending
                                                    }
                                                    className="hover:bg-destructive/20 rounded-sm p-0.5"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                            {group.isOwner && (
                                                <span className="text-xs text-muted-foreground">
                                                    (создатель)
                                                </span>
                                            )}
                                        </Badge>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <p className="text-sm text-muted-foreground py-4">
                                У вас пока нет активных групп
                            </p>
                        )}
                    </div>

                    {/* Доступные для добавления */}
                    <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium">
                                Доступные для добавления (
                                {filteredAvailable?.length || 0})
                            </h3>
                            <div className="relative px-0.5">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Поиск групп..."
                                    value={searchQuery}
                                    onChange={e =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        {loadingAvailable ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : filteredAvailable &&
                          filteredAvailable.length > 0 ? (
                            <ScrollArea className="flex-1">
                                <div className="space-y-2">
                                    {filteredAvailable.map(group => (
                                        <div
                                            key={group.id}
                                            className="flex items-start justify-between gap-4 p-3 border rounded-lg hover:bg-accent"
                                        >
                                            <div className="flex-1 space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex-shrink-0">
                                                        {getVisibilityIcon(
                                                            group.visibility,
                                                        )}
                                                    </span>
                                                    <span className="font-medium line-clamp-2 break-words">
                                                        {group.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground line-clamp-2">
                                                    <span>
                                                        {group.wordsCount} слов
                                                        • by {group.createdBy}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs flex-shrink-0"
                                                    >
                                                        {getVisibilityText(
                                                            group.visibility,
                                                        )}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleActivate(
                                                        group.id,
                                                        group.name,
                                                    )
                                                }
                                                disabled={
                                                    activateMutation.isPending
                                                }
                                                className="flex-shrink-0"
                                            >
                                                {activateMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Plus className="h-4 w-4 sm:mr-1" />
                                                        <span className="hidden sm:inline">
                                                            Добавить
                                                        </span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <p className="text-sm text-muted-foreground py-8 text-center">
                                {searchQuery
                                    ? 'Группы не найдены'
                                    : 'Нет доступных групп для добавления'}
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
