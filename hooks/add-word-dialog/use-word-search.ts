/**
 * Хук для поиска слов в словаре
 */

import { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';
import { useToast } from '@/hooks/shared';
import type { BaseWord } from '@/types/add-word-dialog.types';

type UseWordSearchProps = {
    languageCode: 'en' | 'es';
    open: boolean;
    skipAutoSearch: boolean;
    setSkipAutoSearch: (value: boolean) => void;
};

export function useWordSearch({
    languageCode,
    open,
    skipAutoSearch,
    setSkipAutoSearch,
}: UseWordSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [availableWords, setAvailableWords] = useState<BaseWord[]>([]);
    const [searching, setSearching] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasExactMatch, setHasExactMatch] = useState(false);
    const { toast } = useToast();

    // Debounce поиска на 400мс
    useDebounce(
        () => {
            setDebouncedSearchTerm(searchTerm);
        },
        400,
        [searchTerm],
    );

    // Проверка наличия точных совпадений
    useEffect(() => {
        if (!searchTerm.trim()) {
            setHasExactMatch(false);
            return;
        }

        const trimmedSearch = searchTerm.trim().toLowerCase();
        const exactMatch = availableWords.find(
            word => word.word.toLowerCase() === trimmedSearch,
        );
        setHasExactMatch(!!exactMatch);
    }, [searchTerm, availableWords]);

    // Поиск слов при изменении параметров
    useEffect(() => {
        if (open && !skipAutoSearch) {
            setOffset(0);
            setAvailableWords([]);
            setHasMore(true);
            handleSearch(0, true);
        }

        if (skipAutoSearch) {
            setSkipAutoSearch(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [languageCode, debouncedSearchTerm, open, skipAutoSearch]);

    const handleSearch = async (
        currentOffset: number = offset,
        isNewSearch: boolean = false,
    ) => {
        if (isNewSearch) {
            setSearching(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams({
                languageCode,
                limit: '30',
                offset: currentOffset.toString(),
            });

            if (debouncedSearchTerm.trim()) {
                params.set('search', debouncedSearchTerm.trim());
            }

            const response = await fetch(`/api/base-words?${params}`);

            if (response.ok) {
                const words = await response.json();

                if (isNewSearch) {
                    setAvailableWords(words);
                } else {
                    setAvailableWords(prev => [...prev, ...words]);
                }

                setHasMore(words.length === 30);
                setOffset(currentOffset + words.length);
            } else {
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось загрузить слова',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error searching words:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить слова',
                variant: 'destructive',
            });
        } finally {
            setSearching(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        handleSearch(offset, false);
    };

    const resetSearch = () => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setAvailableWords([]);
        setOffset(0);
        setHasMore(true);
        setHasExactMatch(false);
    };

    return {
        searchTerm,
        setSearchTerm,
        availableWords,
        setAvailableWords,
        searching,
        loadingMore,
        hasMore,
        hasExactMatch,
        handleSearch,
        handleLoadMore,
        resetSearch,
    };
}
