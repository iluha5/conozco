'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface WordsListInfiniteScrollProps {
    hasMore: boolean;
    isFetchingMore: boolean;
    onLoadMore: () => void;
}

export function WordsListInfiniteScroll({
    hasMore,
    isFetchingMore,
    onLoadMore,
}: WordsListInfiniteScrollProps) {
    const { t } = useTranslation();
    const sentinelRef = useRef<HTMLDivElement>(null);

    const handleLoadMore = useCallback(() => {
        if (hasMore && !isFetchingMore) {
            onLoadMore();
        }
    }, [hasMore, isFetchingMore, onLoadMore]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) {
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0]?.isIntersecting) {
                    handleLoadMore();
                }
            },
            { root: sentinel.parentElement, threshold: 0.1 },
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [handleLoadMore]);

    if (!hasMore && !isFetchingMore) {
        return null;
    }

    return (
        <div
            ref={sentinelRef}
            className="flex items-center justify-center py-3"
        >
            {isFetchingMore && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('Loading more words...')}
                </div>
            )}
        </div>
    );
}
