import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { WordsListStatus, WordListItem } from '@/types/words.types';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';
import {
    fetchWordsListPage,
    getWordsListQueryKey,
    WORDS_LIST_PAGE_SIZE,
} from '@/lib/api/words.api';

const EMPTY_WORDS: WordListItem[] = [];

export function useWordsList(
    languageCode: string | null,
    status: WordsListStatus,
    groupIds: number[] = [],
    enabled = true,
) {
    const normalizedGroupIds = useMemo(
        () => [...groupIds].sort((a, b) => a - b),
        [groupIds],
    );

    const queryKey = useMemo(() => {
        if (!languageCode) {
            return ['words-list', 'disabled'] as const;
        }

        return getWordsListQueryKey({
            languageCode,
            status,
            groupIds: normalizedGroupIds,
        });
    }, [languageCode, status, normalizedGroupIds]);

    const {
        data,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
        error,
    } = useInfiniteQuery({
        queryKey,
        queryFn: ({ pageParam }) => {
            if (!languageCode) {
                return Promise.resolve({
                    items: [],
                    totalCount: 0,
                    limit: WORDS_LIST_PAGE_SIZE,
                    offset: 0,
                    hasMore: false,
                });
            }

            return fetchWordsListPage({
                languageCode,
                status,
                groupIds: normalizedGroupIds,
                pageParam: pageParam as number,
            });
        },
        initialPageParam: 0,
        getNextPageParam: lastPage =>
            lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
        enabled: !!languageCode && enabled,
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
    });

    const words = useMemo(
        () => data?.pages.flatMap(page => page.items) ?? EMPTY_WORDS,
        [data],
    );

    const totalCount = data?.pages[0]?.totalCount ?? 0;
    const loadedCount = words.length;

    if (error) {
        console.error('Error fetching words list:', error);
    }

    return {
        words,
        totalCount,
        loadedCount,
        isLoading: isLoading && !data,
        isFetching,
        isFetchingNextPage,
        hasNextPage: hasNextPage ?? false,
        fetchNextPage,
        refetch,
    };
}
