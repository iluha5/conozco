import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import type { Word, WordUpdateCallback } from '../typing';

interface UseWordStatusProps {
    onWordUpdate?: WordUpdateCallback;
    onWordsChange?: () => Promise<void>;
    readOnly?: boolean;
}

export function useWordStatus({
    onWordUpdate,
    onWordsChange,
    readOnly = false,
}: UseWordStatusProps) {
    const { t } = useTranslation();
    const [optimisticWords, setOptimisticWords] = useState<
        Map<string | number, Word>
    >(new Map());

    const handleToggleStatus = async (word: Word) => {
        if (readOnly) return;

        const newStatus = word.status === 'LEARNED' ? 'NOT_LEARNED' : 'LEARNED';

        // Save old state for rollback
        const oldWord = { ...word };

        // Optimistic update - change status immediately
        if (onWordUpdate) {
            onWordUpdate(word.id, { status: newStatus });
        }

        // Save optimistic state
        setOptimisticWords(prev => {
            const newMap = new Map(prev);
            newMap.set(word.id, { ...word, status: newStatus });
            return newMap;
        });

        try {
            const response = await fetch(`/api/words/${word.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                // Successfully updated, do nothing (already updated optimistically)
            } else {
                // Error - rollback state
                if (onWordUpdate) {
                    onWordUpdate(word.id, { status: oldWord.status });
                } else {
                    await onWordsChange?.();
                }
                // Remove from optimistic
                setOptimisticWords(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(word.id);
                    return newMap;
                });
            }
        } catch (error) {
            console.error('Error updating word:', error);
            // Error - rollback state
            if (onWordUpdate) {
                onWordUpdate(word.id, { status: oldWord.status });
            } else {
                await onWordsChange?.();
            }
            // Remove from optimistic
            setOptimisticWords(prev => {
                const newMap = new Map(prev);
                newMap.delete(word.id);
                return newMap;
            });
        }
    };

    const handleBulkStatusChange = (_newStatus: 'LEARNED' | 'NOT_LEARNED') => {
        if (readOnly) return;

        // This function now just opens confirmation dialog
        // Real logic will be in executeBulkStatusChange
    };

    const executeBulkStatusChange = async (
        selectedWords: (string | number)[],
        newStatus: 'LEARNED' | 'NOT_LEARNED',
        onWordUpdate?: WordUpdateCallback,
        onWordsChange?: () => Promise<void>,
        onError?: (_message: string) => void,
    ): Promise<boolean> => {
        if (selectedWords.length === 0) return false;

        try {
            // Optimistic update - update UI immediately
            if (onWordUpdate) {
                for (const wordId of selectedWords) {
                    onWordUpdate(wordId, { status: newStatus });
                }
            }

            // One request for all words
            const response = await fetch('/api/words/bulk', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wordIds: selectedWords,
                    status: newStatus,
                }),
            });

            if (!response.ok) {
                // Error - reload data for rollback
                console.error('Bulk status update failed');
                await onWordsChange?.();
                onError?.(t('Failed to change word status'));
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error updating words status:', error);
            // On error reload data
            await onWordsChange?.();
            onError?.(t('An error occurred while changing word status'));
            return false;
        }
    };

    const handleMarkAsLearned = () => {
        // This function opens confirmation dialog for LEARNED status
    };

    return {
        optimisticWords,
        handleToggleStatus,
        handleBulkStatusChange,
        executeBulkStatusChange,
        handleMarkAsLearned,
    };
}
