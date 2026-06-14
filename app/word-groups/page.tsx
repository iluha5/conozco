'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
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
import { Loader2, Search, X, Crown, Eye } from 'lucide-react';
import { Header } from '@/components/Header';
import {
    useActiveWordGroups,
    useAvailableWordGroups,
    useActivateWordGroup,
    useDeactivateWordGroup,
} from '@/hooks/word-groups/use-active-word-groups';
import { toast } from 'sonner';
import { GroupWordsDialog } from '@/components/word-groups/GroupWordsDialog';
import { useHashDialog } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import { useEffectiveSettings } from '@/hooks/settings';

// Combined group type for display
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
    const { t } = useTranslation();
    const { status } = useSession();
    const isGuest = status === 'unauthenticated';
    const { settings } = useEffectiveSettings();
    const learnLanguageCode = settings?.learnLanguage?.code || null;
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingGroups, setLoadingGroups] = useState<Set<number>>(new Set());
    const [optimisticActiveGroups, setOptimisticActiveGroups] = useState<
        Set<number>
    >(new Set());
    const [selectedGroupForView, setSelectedGroupForViewData] = useState<{
        id: number;
        name: string;
        wordsCount: number;
    } | null>(null);
    const { open: groupViewDialogOpen, setOpen: setGroupViewDialogOpen } =
        useHashDialog('view-group-words');

    const setSelectedGroupForView = (
        group: { id: number; name: string; wordsCount: number } | null,
    ) => {
        setSelectedGroupForViewData(group);
        setGroupViewDialogOpen(!!group);
    };

    // Filters
    const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');
    const [activityFilter, setActivityFilter] = useState<string>('ALL');

    const { data: activeGroups, isLoading: loadingActive } =
        useActiveWordGroups(!isGuest);
    const { data: availableGroups, isLoading: loadingAvailable } =
        useAvailableWordGroups(!isGuest);

    const { data: publicGroups = [], isLoading: loadingPublic } = useQuery<
        CombinedWordGroup[]
    >({
        queryKey: ['publicWordGroups', learnLanguageCode],
        queryFn: async () => {
            const response = await fetch(
                `/api/public/word-groups?languageCode=${learnLanguageCode || ''}`,
            );
            if (!response.ok) {
                throw new Error('Failed to fetch public word groups');
            }
            return response.json();
        },
        enabled: isGuest && !!learnLanguageCode,
    });

    const activateMutation = useActivateWordGroup();
    const deactivateMutation = useDeactivateWordGroup();

    // Sync optimistic state with real data
    useEffect(() => {
        if (activeGroups) {
            setOptimisticActiveGroups(new Set(activeGroups.map(g => g.id)));
        }
    }, [activeGroups]);

    // Combine active and available groups into one list
    const combinedGroups = useMemo<CombinedWordGroup[]>(() => {
        if (isGuest) {
            return (publicGroups || [])
                .map(group => ({
                    id: group.id,
                    name: group.name,
                    wordsCount: group.wordsCount,
                    visibility: group.visibility,
                    createdBy: group.createdBy,
                    isActive: false,
                    isOwner: false,
                    canRemove: false,
                }))
                .sort((first, second) => first.name.localeCompare(second.name));
        }

        const groups: CombinedWordGroup[] = [];

        // Add active groups
        if (activeGroups) {
            activeGroups.forEach(group => {
                groups.push({
                    id: group.id,
                    name: group.name,
                    wordsCount: group.wordsCount,
                    visibility: group.visibility,
                    createdBy: t('You'), // Don't show creator for active groups
                    isActive: true,
                    isOwner: group.isOwner,
                    canRemove: group.canRemove,
                });
            });
        }

        // Add available groups (if not active)
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
    }, [activeGroups, availableGroups, publicGroups, isGuest, t]);

    const handleToggleGroup = async (
        groupId: number,
        groupName: string,
        currentlyActive: boolean,
    ) => {
        if (isGuest) {
            return;
        }
        // Optimistic state update
        setOptimisticActiveGroups(prev => {
            const newSet = new Set(prev);
            if (currentlyActive) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });

        // Set loading state
        setLoadingGroups(prev => new Set(prev).add(groupId));

        try {
            if (currentlyActive) {
                await deactivateMutation.mutateAsync(groupId);
                toast.success(
                    t('Group "{{name}}" removed', { name: groupName }),
                );
            } else {
                await activateMutation.mutateAsync(groupId);
                toast.success(t('Group "{{name}}" added', { name: groupName }));
            }
        } catch (error) {
            // Rollback optimistic update on error
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
                      ? t('Error removing group')
                      : t('Error adding group'),
            );
        } finally {
            // Remove loading state
            setLoadingGroups(prev => {
                const newSet = new Set(prev);
                newSet.delete(groupId);
                return newSet;
            });
        }
    };

    // Filter combined list by search query and filters
    const filteredGroups = combinedGroups.filter(group => {
        // Search query
        const matchesSearch = group.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        // Access type filter
        const matchesVisibility =
            visibilityFilter === 'ALL' || group.visibility === visibilityFilter;

        // Activity filter
        const matchesActivity =
            activityFilter === 'ALL' ||
            (activityFilter === 'ACTIVE' && group.isActive) ||
            (activityFilter === 'INACTIVE' && !group.isActive);

        return matchesSearch && matchesVisibility && matchesActivity;
    });

    const getVisibilityText = (visibility: 'PUBLIC' | 'PRIVATE' | 'SHARED') => {
        switch (visibility) {
            case 'PUBLIC':
                return t('Public');
            case 'PRIVATE':
                return t('Private');
            case 'SHARED':
                return t('Shared');
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
                                {t('Word groups management')}
                            </CardTitle>
                            <p className="hidden sm:block text-sm text-muted-foreground mt-2">
                                {t('Add or remove word groups for filtering')}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isGuest && (
                                <div className="rounded-lg border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-gray-700">
                                    <Link
                                        href="/auth/login"
                                        className="underline"
                                    >
                                        {t('Log in')}
                                    </Link>
                                    {t(
                                        ' to activate word groups and save your learning progress. No paid features. No ads.',
                                    )}
                                </div>
                            )}

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('Search groups...')}
                                    value={searchQuery}
                                    onChange={e =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>

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
                                                {t('All types')}
                                            </SelectItem>
                                            <SelectItem value="PUBLIC">
                                                {t('Public')}
                                            </SelectItem>
                                            <SelectItem value="PRIVATE">
                                                {t('Private')}
                                            </SelectItem>
                                            <SelectItem value="SHARED">
                                                {t('Shared')}
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
                                                {t('All groups')}
                                            </SelectItem>
                                            <SelectItem value="ACTIVE">
                                                {t('Active')}
                                            </SelectItem>
                                            <SelectItem value="INACTIVE">
                                                {t('Inactive')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

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
                                    {t('Shown:')}{' '}
                                    <span className="font-semibold text-gray-900">
                                        {filteredGroups.length}
                                    </span>
                                </div>
                            </div>

                            {loadingActive ||
                            loadingAvailable ||
                            (isGuest && loadingPublic) ? (
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
                                                className={`transition-all hover:bg-gray-50 m-1 ${
                                                    isCurrentlyActive
                                                        ? 'ring-2 ring-black'
                                                        : ''
                                                }`}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div
                                                            className={`flex items-center gap-3 flex-1 min-w-0 ${
                                                                isGuest
                                                                    ? ''
                                                                    : 'cursor-pointer'
                                                            }`}
                                                            onClick={() => {
                                                                if (
                                                                    isGuest ||
                                                                    isLoading
                                                                ) {
                                                                    return;
                                                                }

                                                                handleToggleGroup(
                                                                    group.id,
                                                                    group.name,
                                                                    isCurrentlyActive,
                                                                );
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isLoading ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                                ) : (
                                                                    <Checkbox
                                                                        checked={
                                                                            isCurrentlyActive
                                                                        }
                                                                        disabled={
                                                                            isGuest
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
                                                                        {t(
                                                                            'words',
                                                                        )}
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
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="shrink-0"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setSelectedGroupForView(
                                                                    {
                                                                        id: group.id,
                                                                        name: group.name,
                                                                        wordsCount:
                                                                            group.wordsCount,
                                                                    },
                                                                );
                                                            }}
                                                            title={t(
                                                                'View words',
                                                            )}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
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
                                            ? t('Groups not found')
                                            : t('No available groups')}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {selectedGroupForView && (
                <GroupWordsDialog
                    open={groupViewDialogOpen}
                    onOpenChange={open => {
                        if (!open) {
                            setSelectedGroupForView(null);
                        }
                    }}
                    groupId={selectedGroupForView.id}
                    groupName={selectedGroupForView.name}
                    wordsCount={selectedGroupForView.wordsCount}
                    isGuest={isGuest}
                />
            )}
        </div>
    );
}
