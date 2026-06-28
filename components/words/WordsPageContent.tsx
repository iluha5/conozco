'use client';

import {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
    type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Square, CheckSquare, MinusSquare } from 'lucide-react';
import { Header } from '@/components/Header';
import { ArrowLeft } from 'lucide-react';
import { AddWordDialog } from '@/components/AddWordDialog';
import { WordsList } from '@/components/WordList/WordList';
import { WordGroupsFilter } from '@/components/word-groups/WordGroupsFilter';
import { BulkActions } from '@/components/WordList/components/BulkActions';
import { ConfirmationDialogs } from '@/components/WordList/components/ConfirmationDialogs';
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
} from '@/components/ui/popover';
import { useUserSettings } from '@/hooks/settings';
import { useWordsList, useWordsPageStats } from '@/hooks/words';
import { useWordGroupsFilter } from '@/hooks/word-groups/use-word-groups-filter';
import { useWordSelection } from '@/components/WordList/hooks/useWordSelection';
import { useConfirmationDialogs } from '@/components/WordList/hooks/useConfirmationDialogs';
import { useWordStatus } from '@/components/WordList/hooks/useWordStatus';
import { useWordDeletion } from '@/components/WordList/hooks/useWordDeletion';
import { useToast } from '@/hooks/shared';
import {
    getSelectionState,
    getBulkSelectText,
} from '@/components/WordList/helpers/selectionHelpers';
import {
    WordsListStatus,
    WordsListResponse,
    WordChangedEvent,
} from '@/types/words.types';
import { useTranslation } from '@/lib/i18n';
import { fetchWordsListPage, getWordsListQueryKey } from '@/lib/api/words.api';
import { TrainingStats } from '@/lib/api/training.api';
import type { Word } from '@/components/WordList/typing';

export function WordsPageContent() {
    const { settings: userSettings } = useUserSettings();
    const [selectedStatus, setSelectedStatus] =
        useState<WordsListStatus>('NOT_LEARNED');
    const [isClient, setIsClient] = useState(false);
    const [counterHintOpen, setCounterHintOpen] = useState(false);
    const [supportsHover, setSupportsHover] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const hasPrefetchedAll = useRef(false);

    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { t } = useTranslation();

    const learnLanguageCode = useMemo(() => {
        return userSettings?.learnLanguage?.code || null;
    }, [userSettings?.learnLanguage?.code]);

    const { selectedGroupIds, toggleGroup, toggleAll } =
        useWordGroupsFilter('myWords');

    const normalizedGroupIds = useMemo(
        () => [...selectedGroupIds].sort((a, b) => a - b),
        [selectedGroupIds],
    );

    const hasGroupFilter = normalizedGroupIds.length > 0;

    const { stats, isLoading: statsLoading } =
        useWordsPageStats(learnLanguageCode);

    const {
        words,
        totalCount,
        loadedCount,
        isLoading: listLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
    } = useWordsList(
        learnLanguageCode,
        selectedStatus,
        normalizedGroupIds,
        true,
    );

    const loading = statsLoading || listLoading;

    const invalidateWordsQueries = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: ['words-list'] });
        if (learnLanguageCode) {
            await queryClient.invalidateQueries({
                queryKey: ['training-stats', learnLanguageCode],
            });
        }
    }, [queryClient, learnLanguageCode]);

    const handleWordsChange = useCallback(async () => {
        await invalidateWordsQueries();
    }, [invalidateWordsQueries]);

    const handleWordRemove = useCallback(
        (wordId: string | number) => {
            queryClient.setQueriesData<InfiniteData<WordsListResponse, number>>(
                { queryKey: ['words-list'] },
                oldData => {
                    if (!oldData) {
                        return oldData;
                    }

                    const wordInQuery = oldData.pages.some(page =>
                        page.items.some(
                            word => String(word.id) === String(wordId),
                        ),
                    );

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page, pageIndex) => ({
                            ...page,
                            items: page.items.filter(
                                word => String(word.id) !== String(wordId),
                            ),
                            totalCount:
                                wordInQuery && pageIndex === 0
                                    ? Math.max(0, page.totalCount - 1)
                                    : page.totalCount,
                        })),
                    };
                },
            );
        },
        [queryClient],
    );

    const updateTrainingStats = useCallback(
        (update: (_stats: TrainingStats) => TrainingStats) => {
            if (!learnLanguageCode) {
                return;
            }

            queryClient.setQueryData<TrainingStats>(
                ['training-stats', learnLanguageCode],
                oldData => {
                    if (!oldData) {
                        return oldData;
                    }

                    return update(oldData);
                },
            );
        },
        [queryClient, learnLanguageCode],
    );

    const handleWordChanged = useCallback(
        (change: WordChangedEvent) => {
            if (change.action === 'add') {
                const matchesGroupFilter =
                    !hasGroupFilter ||
                    (change.wordGroupIds?.some(groupId =>
                        normalizedGroupIds.includes(groupId),
                    ) ??
                        false);

                if (
                    matchesGroupFilter &&
                    learnLanguageCode &&
                    change.item.status === 'NOT_LEARNED'
                ) {
                    const queryKey = getWordsListQueryKey({
                        languageCode: learnLanguageCode,
                        status: 'NOT_LEARNED',
                        groupIds: normalizedGroupIds,
                    });

                    queryClient.setQueryData<
                        InfiniteData<WordsListResponse, number>
                    >(queryKey, oldData => {
                        if (!oldData?.pages[0]) {
                            return oldData;
                        }

                        const alreadyExists = oldData.pages.some(page =>
                            page.items.some(word => word.id === change.item.id),
                        );

                        if (alreadyExists) {
                            return oldData;
                        }

                        return {
                            ...oldData,
                            pages: oldData.pages.map((page, pageIndex) =>
                                pageIndex === 0
                                    ? {
                                          ...page,
                                          items: [change.item, ...page.items],
                                          totalCount: page.totalCount + 1,
                                      }
                                    : page,
                            ),
                        };
                    });
                }

                updateTrainingStats(stats => ({
                    notLearnedCount: stats.notLearnedCount + 1,
                    learnedCount: stats.learnedCount,
                    totalCount: stats.totalCount + 1,
                }));
                return;
            }

            let removedStatus: 'LEARNED' | 'NOT_LEARNED' | null = null;

            queryClient.setQueriesData<InfiniteData<WordsListResponse, number>>(
                { queryKey: ['words-list'] },
                oldData => {
                    if (!oldData) {
                        return oldData;
                    }

                    for (const page of oldData.pages) {
                        const found = page.items.find(
                            word => word.id === change.wordId,
                        );
                        if (found) {
                            removedStatus = found.status;
                            break;
                        }
                    }

                    const wordInQuery = oldData.pages.some(page =>
                        page.items.some(word => word.id === change.wordId),
                    );

                    return {
                        ...oldData,
                        pages: oldData.pages.map((page, pageIndex) => ({
                            ...page,
                            items: page.items.filter(
                                word => word.id !== change.wordId,
                            ),
                            totalCount:
                                wordInQuery && pageIndex === 0
                                    ? Math.max(0, page.totalCount - 1)
                                    : page.totalCount,
                        })),
                    };
                },
            );

            updateTrainingStats(stats => ({
                notLearnedCount:
                    removedStatus === 'LEARNED'
                        ? stats.notLearnedCount
                        : Math.max(0, stats.notLearnedCount - 1),
                learnedCount:
                    removedStatus === 'LEARNED'
                        ? Math.max(0, stats.learnedCount - 1)
                        : stats.learnedCount,
                totalCount: Math.max(0, stats.totalCount - 1),
            }));
        },
        [
            hasGroupFilter,
            learnLanguageCode,
            normalizedGroupIds,
            queryClient,
            updateTrainingStats,
        ],
    );

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            '(hover: hover) and (pointer: fine)',
        );
        const updateSupportsHover = () => {
            setSupportsHover(mediaQuery.matches);
        };

        updateSupportsHover();
        mediaQuery.addEventListener('change', updateSupportsHover);

        return () => {
            mediaQuery.removeEventListener('change', updateSupportsHover);
        };
    }, []);

    const handleCounterHintMouseEnter = useCallback(() => {
        if (supportsHover) {
            setCounterHintOpen(true);
        }
    }, [supportsHover]);

    const handleCounterHintMouseLeave = useCallback(() => {
        if (supportsHover) {
            setCounterHintOpen(false);
        }
    }, [supportsHover]);

    const handleCounterHintClick = useCallback(() => {
        if (!supportsHover) {
            setCounterHintOpen(open => !open);
        }
    }, [supportsHover]);

    const handleCounterHintKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setCounterHintOpen(open => !open);
            }
        },
        [],
    );

    const handleCounterHintContentClick = useCallback(() => {
        setCounterHintOpen(false);
    }, []);

    useEffect(() => {
        if (!learnLanguageCode) {
            return;
        }

        const prefetchStatus = (status: WordsListStatus) => {
            void queryClient.prefetchInfiniteQuery({
                queryKey: getWordsListQueryKey({
                    languageCode: learnLanguageCode,
                    status,
                    groupIds: normalizedGroupIds,
                }),
                queryFn: ({ pageParam }) =>
                    fetchWordsListPage({
                        languageCode: learnLanguageCode,
                        status,
                        groupIds: normalizedGroupIds,
                        pageParam: pageParam as number,
                    }),
                initialPageParam: 0,
            });
        };

        prefetchStatus('NOT_LEARNED');
        prefetchStatus('LEARNED');
    }, [learnLanguageCode, normalizedGroupIds, queryClient]);

    const handleStatusTabChange = (status: WordsListStatus) => {
        setSelectedStatus(status);

        if (
            status === 'ALL' &&
            !hasPrefetchedAll.current &&
            learnLanguageCode
        ) {
            hasPrefetchedAll.current = true;
            void queryClient.prefetchInfiniteQuery({
                queryKey: getWordsListQueryKey({
                    languageCode: learnLanguageCode,
                    status: 'ALL',
                    groupIds: normalizedGroupIds,
                }),
                queryFn: ({ pageParam }) =>
                    fetchWordsListPage({
                        languageCode: learnLanguageCode,
                        status: 'ALL',
                        groupIds: normalizedGroupIds,
                        pageParam: pageParam as number,
                    }),
                initialPageParam: 0,
            });
        }
    };

    const wordSelection = useWordSelection(words as Word[]);
    const selectionState = getSelectionState(
        wordSelection.selectedWords,
        words as Word[],
    );

    const confirmations = useConfirmationDialogs();
    const status = useWordStatus({ onWordsChange: handleWordsChange });
    const deletion = useWordDeletion({
        onWordRemove: handleWordRemove,
        onWordsChange: handleWordsChange,
    });

    const totalForBadge = useMemo(() => {
        if (hasGroupFilter) {
            return totalCount;
        }

        if (selectedStatus === 'ALL') {
            return stats.total;
        }

        if (selectedStatus === 'NOT_LEARNED') {
            return stats.notLearned;
        }

        return stats.learned;
    }, [hasGroupFilter, totalCount, selectedStatus, stats]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleMarkAsLearned = () => {
        confirmations.openStatusConfirmation('LEARNED');
    };

    const handleBulkStatusChange = (newStatus: 'LEARNED' | 'NOT_LEARNED') => {
        if (wordSelection.selectedWords.length === 0) {
            toast({
                title: t('Error'),
                description: t('Select words to change status'),
                variant: 'destructive',
            });
            return;
        }
        confirmations.openStatusConfirmation(newStatus);
    };

    const executeBulkStatusChange = async () => {
        if (!confirmations.pendingStatusAction) return;

        const newStatus = confirmations.pendingStatusAction;
        const successCount = wordSelection.selectedWords.length;

        setIsUpdatingStatus(true);

        const success = await status.executeBulkStatusChange(
            wordSelection.selectedWords,
            newStatus,
            undefined,
            handleWordsChange,
            errorMessage => {
                toast({
                    title: t('Error'),
                    description: errorMessage,
                    variant: 'destructive',
                });
            },
        );

        setIsUpdatingStatus(false);

        if (success) {
            const statusText =
                newStatus === 'LEARNED'
                    ? t('marked as learned')
                    : t('marked as not learned');
            toast({
                title: t('Success'),
                description: `${successCount} ${t('words')} ${statusText}`,
                variant: 'success',
            });
            await handleWordsChange();
        }

        wordSelection.clearSelection();
        confirmations.closeStatusConfirmation();
    };

    const handleBulkDelete = () => {
        if (wordSelection.selectedWords.length === 0) {
            toast({
                title: t('Error'),
                description: t('Select words to delete'),
                variant: 'destructive',
            });
            return;
        }
        confirmations.openDeleteConfirmation();
    };

    const executeBulkDelete = async () => {
        const successCount = wordSelection.selectedWords.length;

        setIsDeleting(true);

        const success = await deletion.executeBulkDelete(
            wordSelection.selectedWords,
            handleWordRemove,
            handleWordsChange,
            errorMessage => {
                toast({
                    title: t('Error'),
                    description: errorMessage,
                    variant: 'destructive',
                });
            },
        );

        setIsDeleting(false);

        if (success) {
            toast({
                title: t('Success'),
                description: `${successCount} ${t('words')} ${t('deleted')}`,
                variant: 'success',
            });
            await handleWordsChange();
        }

        wordSelection.clearSelection();
        confirmations.handleCloseDeleteDialog();
    };

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <Header />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <p className="text-gray-600">{t('Loading...')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Header />
            <div className="container mx-auto px-4 py-4">
                <div className="mb-3">
                    <Link href="/">
                        <Button variant="ghost">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {t('Back')}
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-row justify-between items-center gap-4 mb-6">
                    <h1 className="text-4xl font-bold text-gray-900">
                        {t('My words')}
                    </h1>
                    <div className="flex flex-row gap-2 w-auto">
                        <div className="flex-none min-w-0">
                            <AddWordDialog onWordChanged={handleWordChanged} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    <Card
                        className={`flex flex-col justify-between flex-1 max-w-[140px] cursor-pointer transition-all hover:shadow-md ${
                            selectedStatus === 'ALL'
                                ? 'ring-2 ring-black shadow-md'
                                : ''
                        }`}
                        onClick={() => handleStatusTabChange('ALL')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Total words')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`flex flex-col justify-between flex-1 max-w-[140px] cursor-pointer transition-all hover:shadow-md ${
                            selectedStatus === 'NOT_LEARNED'
                                ? 'ring-2 ring-orange-500 shadow-md'
                                : ''
                        }`}
                        onClick={() => handleStatusTabChange('NOT_LEARNED')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Not learned')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.notLearned}
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className={`flex flex-col justify-between flex-1 max-w-[140px] cursor-pointer transition-all hover:shadow-md ${
                            selectedStatus === 'LEARNED'
                                ? 'ring-2 ring-green-500 shadow-md'
                                : ''
                        }`}
                        onClick={() => handleStatusTabChange('LEARNED')}
                    >
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                                {t('Learned')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {stats.learned}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {!loading && (
                    <div className="mb-6">
                        <BulkActions
                            words={words as Word[]}
                            selectedWords={wordSelection.selectedWords}
                            onToggleAllSelection={
                                wordSelection.toggleAllWordsSelection
                            }
                            onMarkAsLearned={handleMarkAsLearned}
                            onChangeStatus={handleBulkStatusChange}
                            onDelete={handleBulkDelete}
                            hideSelectAllButton={true}
                        />
                    </div>
                )}

                {!loading && (
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={wordSelection.toggleAllWordsSelection}
                        >
                            {(() => {
                                if (selectionState === 'none') {
                                    return <Square className="mr-2 h-4 w-4" />;
                                } else if (selectionState === 'all') {
                                    return (
                                        <CheckSquare className="mr-2 h-4 w-4" />
                                    );
                                } else {
                                    return (
                                        <MinusSquare className="mr-2 h-4 w-4" />
                                    );
                                }
                            })()}
                            {getBulkSelectText(selectionState, t)}
                        </Button>
                        <WordGroupsFilter
                            selectedGroupIds={selectedGroupIds}
                            onToggleGroup={toggleGroup}
                            onToggleAll={toggleAll}
                        />
                        <Popover
                            open={counterHintOpen}
                            onOpenChange={setCounterHintOpen}
                        >
                            <PopoverAnchor asChild>
                                <div
                                    className="flex items-center gap-2 cursor-help"
                                    role="button"
                                    tabIndex={0}
                                    onClick={handleCounterHintClick}
                                    onMouseEnter={handleCounterHintMouseEnter}
                                    onMouseLeave={handleCounterHintMouseLeave}
                                    onKeyDown={handleCounterHintKeyDown}
                                >
                                    <Badge
                                        variant="outline"
                                        className="gap-1.5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm text-sm"
                                    >
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {loadedCount}
                                        </span>
                                        <span className="text-gray-300 dark:text-gray-600">
                                            |
                                        </span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {totalForBadge}
                                        </span>
                                        {wordSelection.selectedWords.length >
                                            0 && (
                                            <>
                                                <span className="text-gray-300 dark:text-gray-600">
                                                    |
                                                </span>
                                                <span className="text-orange-600 dark:text-orange-500">
                                                    {
                                                        wordSelection
                                                            .selectedWords
                                                            .length
                                                    }
                                                </span>
                                            </>
                                        )}
                                    </Badge>
                                </div>
                            </PopoverAnchor>
                            <PopoverContent
                                className="max-w-xs w-auto px-3 py-1.5 text-sm"
                                onClick={handleCounterHintContentClick}
                                onOpenAutoFocus={event =>
                                    event.preventDefault()
                                }
                            >
                                <p>
                                    {t(
                                        'Shown {{shown}} of {{total}} words. Scroll down the list to load more. {{selected}} selected.',
                                        {
                                            shown: loadedCount,
                                            total: totalForBadge,
                                            selected:
                                                wordSelection.selectedWords
                                                    .length,
                                        },
                                    )}
                                </p>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600">{t('Loading...')}</p>
                    </div>
                ) : (
                    <WordsList
                        words={words as Word[]}
                        onWordsChange={handleWordsChange}
                        onWordRemove={handleWordRemove}
                        showBulkActions={false}
                        emptyMessage={t('No words found. Add a new word!')}
                        externalSelection={wordSelection}
                        hasMore={hasNextPage}
                        isFetchingMore={isFetchingNextPage}
                        onLoadMore={handleLoadMore}
                    />
                )}

                <ConfirmationDialogs
                    deleteDialogOpen={confirmations.confirmDeleteDialogOpen}
                    statusDialogOpen={confirmations.confirmStatusDialogOpen}
                    pendingStatusAction={confirmations.pendingStatusAction}
                    selectedWordsCount={wordSelection.selectedWords.length}
                    isDeleting={isDeleting}
                    isUpdatingStatus={isUpdatingStatus}
                    onCloseDeleteDialog={confirmations.handleCloseDeleteDialog}
                    onCloseStatusDialog={confirmations.handleCloseStatusDialog}
                    onConfirmDelete={executeBulkDelete}
                    onConfirmStatus={executeBulkStatusChange}
                />
            </div>
        </div>
    );
}
