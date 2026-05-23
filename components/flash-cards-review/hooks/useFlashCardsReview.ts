import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    FlashCardsReviewParams,
    FlashCardsReviewStats,
    FlashCardWord,
} from '../typing';
import { useFlashCardsMutations } from './useFlashCardsMutations';
import { useUserSettings } from '@/hooks/settings/use-user-settings';

async function fetchReviewWords(
    params: FlashCardsReviewParams,
): Promise<FlashCardWord[]> {
    const searchParams = new URLSearchParams();

    if (params.status) {
        searchParams.append('status', params.status);
    }
    if (params.limit) {
        searchParams.append('limit', params.limit.toString());
    }
    if (params.random !== undefined) {
        searchParams.append('random', params.random.toString());
    }
    if (params.groupIds && params.groupIds.length > 0) {
        searchParams.append('groupIds', params.groupIds.join(','));
    }
    if (params.languageCode) {
        searchParams.append('languageCode', params.languageCode);
    }
    if (params.source) {
        searchParams.append('source', params.source);
    }
    if (params.includeAllGroups !== undefined) {
        searchParams.append(
            'includeAllGroups',
            params.includeAllGroups.toString(),
        );
    }

    const response = await fetch(
        `/api/words/review?${searchParams.toString()}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch review words');
    }

    return response.json();
}

export function useFlashCardsReview(
    params: FlashCardsReviewParams,
    enabled: boolean = true,
) {
    const { settings: userSettings } = useUserSettings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stats, setStats] = useState<FlashCardsReviewStats>({
        total: 0,
        known: 0,
        dontKnow: 0,
        deleted: 0,
    });
    const [isCompleted, setIsCompleted] = useState(false);
    const [sessionId] = useState(() => Date.now().toString());

    const reviewParams: FlashCardsReviewParams = {
        ...params,
        languageCode:
            params.languageCode ||
            userSettings?.learnLanguage?.code ||
            undefined,
    };

    // Use sessionId so each open re-shuffles the set
    const {
        data: words = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['flash-cards-words', reviewParams, sessionId],
        queryFn: () => fetchReviewWords(reviewParams),
        staleTime: 0,
        gcTime: 0,
        enabled: enabled && !!userSettings?.learnLanguage?.code,
    });

    const { updateWordStatus, deleteWord } =
        useFlashCardsMutations(reviewParams);

    useEffect(() => {
        if (words.length > 0 && currentIndex === 0 && stats.total === 0) {
            setStats({
                total: words.length,
                known: 0,
                dontKnow: 0,
                deleted: 0,
            });
            setCurrentIndex(0);
            setIsCompleted(false);
        }
    }, [words.length, currentIndex, stats.total]);

    useEffect(() => {
        if (words.length === 0 && stats.total > 0) {
            setIsCompleted(true);
            return;
        }
        if (currentIndex >= words.length && words.length > 0) {
            setIsCompleted(true);
        }
        // Do not reset isCompleted back to false: prevents completion screen
        // flickering on optimistic updates
    }, [currentIndex, words.length, stats.total]);

    const handleAction = useCallback(
        async (action: 'know' | 'dont-know' | 'delete' | 'skip') => {
            const currentWord = words[currentIndex];
            if (!currentWord) return;

            const isLastWord = currentIndex === words.length - 1;

            if (action === 'delete' || action === 'skip') {
                setStats(prev => ({
                    ...prev,
                    deleted: prev.deleted + 1,
                }));
            } else if (action === 'dont-know') {
                setStats(prev => ({
                    ...prev,
                    dontKnow: prev.dontKnow + 1,
                }));
            } else if (action === 'know') {
                setStats(prev => ({
                    ...prev,
                    known: prev.known + 1,
                }));
            }

            if (isLastWord) {
                setIsCompleted(true);
            } else {
                setCurrentIndex(currentIndex + 1);
            }

            try {
                if (action === 'delete') {
                    await deleteWord.mutateAsync(currentWord.id);
                } else if (action === 'skip') {
                    // No request: skip is purely optimistic
                } else if (action === 'dont-know') {
                    await updateWordStatus.mutateAsync({
                        wordId: currentWord.id,
                        status: 'NOT_LEARNED',
                        baseWordId: currentWord.baseWordId,
                        belongsToUser: currentWord.belongsToUser,
                    });
                } else if (action === 'know') {
                    await updateWordStatus.mutateAsync({
                        wordId: currentWord.id,
                        status: 'LEARNED',
                        baseWordId: currentWord.baseWordId,
                        belongsToUser: currentWord.belongsToUser,
                    });
                }
            } catch (error) {
                console.error('Error handling card action:', error);
                if (!isLastWord) {
                    setCurrentIndex(currentIndex);
                }
                if (action === 'delete' || action === 'skip') {
                    setStats(prev => ({
                        ...prev,
                        deleted: Math.max(0, prev.deleted - 1),
                    }));
                } else if (action === 'dont-know') {
                    setStats(prev => ({
                        ...prev,
                        dontKnow: Math.max(0, prev.dontKnow - 1),
                    }));
                } else if (action === 'know') {
                    setStats(prev => ({
                        ...prev,
                        known: Math.max(0, prev.known - 1),
                    }));
                }
                if (isLastWord && isCompleted) {
                    setIsCompleted(false);
                }
            }
        },
        [currentIndex, words, deleteWord, updateWordStatus, isCompleted],
    );

    const currentWord = useMemo(() => {
        if (currentIndex >= words.length || words.length === 0) {
            return null;
        }
        return words[currentIndex] || null;
    }, [words, currentIndex]);

    const progress = useMemo(() => {
        if (words.length === 0) return 0;
        return (currentIndex / words.length) * 100;
    }, [currentIndex, words.length]);

    return {
        words,
        currentWord,
        currentIndex,
        totalWords: words.length,
        isLoading,
        error,
        isCompleted,
        stats,
        progress,
        handleAction,
        refetch,
    };
}
