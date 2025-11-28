import { useState } from 'react';

export function useWordLoading() {
    const [loadingWords, setLoadingWords] = useState<Set<string | number>>(
        new Set(),
    );
    const [errorWords, setErrorWords] = useState<Set<string | number>>(
        new Set(),
    );

    const setWordLoading = (wordId: string | number, loading: boolean) => {
        setLoadingWords(prev => {
            const newSet = new Set(prev);
            if (loading) {
                newSet.add(wordId);
            } else {
                newSet.delete(wordId);
            }
            return newSet;
        });
    };

    const setWordError = (wordId: string | number, hasError: boolean) => {
        setErrorWords(prev => {
            const newSet = new Set(prev);
            if (hasError) {
                newSet.add(wordId);
            } else {
                newSet.delete(wordId);
            }
            return newSet;
        });
    };

    const clearWordError = (wordId: string | number) => {
        setWordError(wordId, false);
    };

    const isWordLoading = (wordId: string | number) => {
        return loadingWords.has(wordId);
    };

    const hasWordError = (wordId: string | number) => {
        return errorWords.has(wordId);
    };

    return {
        loadingWords,
        errorWords,
        setWordLoading,
        setWordError,
        clearWordError,
        isWordLoading,
        hasWordError,
    };
}
