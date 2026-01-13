import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import type { Word, WordRemoveCallback } from '../typing';

interface UseWordDeletionProps {
    onWordRemove?: WordRemoveCallback;
    onWordsChange?: () => Promise<void>;
    readOnly?: boolean;
}

export function useWordDeletion({
    onWordRemove,
    onWordsChange,
    readOnly = false,
}: UseWordDeletionProps) {
    const { t } = useTranslation();
    const [deletedWords, setDeletedWords] = useState<
        Map<string | number, Word>
    >(new Map());

    const handleDeleteWord = async (id: string | number, words: Word[]) => {
        if (readOnly) return;

        // Find word for rollback on error
        const wordToDelete = words.find(w => w.id === id);
        if (!wordToDelete) return;

        // Save word for possible rollback
        setDeletedWords(prev => {
            const newMap = new Map(prev);
            newMap.set(id, wordToDelete);
            return newMap;
        });

        // Optimistic update - remove from list immediately
        if (onWordRemove) {
            onWordRemove(id);
        }

        try {
            const response = await fetch(`/api/words/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Successfully deleted - remove from saved for rollback
                setDeletedWords(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(id);
                    return newMap;
                });
            } else {
                // Error - rollback state
                const _deletedWord = deletedWords.get(id) || wordToDelete;
                if (onWordRemove) {
                    // Restore word via onWordRemove (but since no add function, use refetch)
                    await onWordsChange?.();
                } else {
                    await onWordsChange?.();
                }
                setDeletedWords(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(id);
                    return newMap;
                });
            }
        } catch (error) {
            console.error('Error deleting word:', error);
            // Error - rollback state
            const _deletedWord = deletedWords.get(id) || wordToDelete;
            if (onWordRemove) {
                await onWordsChange?.();
            } else {
                await onWordsChange?.();
            }
            setDeletedWords(prev => {
                const newMap = new Map(prev);
                newMap.delete(id);
                return newMap;
            });
        }
    };

    const handleBulkDelete = () => {
        if (readOnly) return;
        // This function now just opens confirmation dialog
        // Real logic will be in executeBulkDelete
    };

    const executeBulkDelete = async (
        selectedWords: (string | number)[],
        onWordRemove?: WordRemoveCallback,
        onWordsChange?: () => Promise<void>,
        onError?: (_message: string) => void,
    ): Promise<boolean> => {
        if (selectedWords.length === 0) return false;

        try {
            // Optimistic update - remove from UI immediately
            if (onWordRemove) {
                for (const wordId of selectedWords) {
                    onWordRemove(wordId);
                }
            }

            // One request for all words
            const response = await fetch('/api/words/bulk', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wordIds: selectedWords,
                }),
            });

            if (!response.ok) {
                // Error - reload data for rollback
                console.error('Bulk delete failed');
                await onWordsChange?.();
                onError?.(t('Failed to delete words'));
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting words:', error);
            // On error reload data
            await onWordsChange?.();
            onError?.(t('An error occurred while deleting words'));
            return false;
        }
    };

    return {
        deletedWords,
        handleDeleteWord,
        handleBulkDelete,
        executeBulkDelete,
    };
}
