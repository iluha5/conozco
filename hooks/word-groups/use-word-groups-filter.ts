import { useState, useEffect } from 'react';
import type { WordGroupsFilterContext } from '@/types/word-groups';

const STORAGE_KEY_PREFIX = 'wordGroupsFilter';

export function useWordGroupsFilter(contextKey: WordGroupsFilterContext) {
    const storageKey = `${STORAGE_KEY_PREFIX}_${contextKey}`;

    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem(storageKey);

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setSelectedGroupIds(parsed);
                }
            } catch (e) {
                console.error('Failed to parse stored group filter', e);
            }
        }
        setIsInitialized(true);
    }, [storageKey, contextKey]);

    // Save to localStorage on change (only after initialization)
    useEffect(() => {
        if (typeof window === 'undefined' || !isInitialized) return;

        localStorage.setItem(storageKey, JSON.stringify(selectedGroupIds));
    }, [selectedGroupIds, storageKey, isInitialized]);

    const toggleGroup = (groupId: number) => {
        setSelectedGroupIds(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId],
        );
    };

    const selectAll = (groupIds: number[]) => {
        setSelectedGroupIds(groupIds);
    };

    const clearAll = () => {
        setSelectedGroupIds([]);
    };

    const toggleAll = (groupIds: number[]) => {
        if (selectedGroupIds.length === groupIds.length) {
            clearAll();
        } else {
            selectAll(groupIds);
        }
    };

    return {
        selectedGroupIds,
        toggleGroup,
        selectAll,
        clearAll,
        toggleAll,
        hasSelection: selectedGroupIds.length > 0,
    };
}
