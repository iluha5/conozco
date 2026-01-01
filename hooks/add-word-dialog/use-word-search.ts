/**
 * Хук для поиска слов в словаре
 */

import { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';
import { useToast } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import type { BaseWord } from '@/types/add-word-dialog.types';
import type { LearnLanguageCode } from '@/config/learn-languages';

type UseWordSearchProps = {
    languageCode: LearnLanguageCode;
    ownLanguageCode?: string;
    open: boolean;
    skipAutoSearch: boolean;
    setSkipAutoSearch: (_value: boolean) => void;
    selectedGroupIds?: number[];
};

export function useWordSearch({
    languageCode,
    ownLanguageCode,
    open,
    skipAutoSearch,
    setSkipAutoSearch,
    selectedGroupIds = [],
}: UseWordSearchProps) {
    const { t } = useTranslation();
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
        // Не запускаем поиск, если поле поиска пустое
        if (!debouncedSearchTerm.trim()) {
            setAvailableWords([]);
            setOffset(0);
            setHasMore(true);
            return;
        }

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
    }, [
        languageCode,
        debouncedSearchTerm,
        open,
        skipAutoSearch,
        selectedGroupIds,
    ]);

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

            // Добавляем код родного языка для поиска по переводам
            if (ownLanguageCode) {
                params.set('translationLanguageCode', ownLanguageCode);
            }

            if (selectedGroupIds.length > 0) {
                params.set('wordGroupIds', selectedGroupIds.join(','));
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
                    title: t('Error'),
                    description: t('Failed to load words'),
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error searching words:', error);
            toast({
                title: t('Error'),
                description: t('Failed to load words'),
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
