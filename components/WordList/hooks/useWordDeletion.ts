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

        // Находим слово для отката при ошибке
        const wordToDelete = words.find(w => w.id === id);
        if (!wordToDelete) return;

        // Сохраняем слово для возможного отката
        setDeletedWords(prev => {
            const newMap = new Map(prev);
            newMap.set(id, wordToDelete);
            return newMap;
        });

        // Оптимистичное обновление - сразу удаляем из списка
        if (onWordRemove) {
            onWordRemove(id);
        }

        try {
            const response = await fetch(`/api/words/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Успешно удалено - удаляем из сохраненных для отката
                setDeletedWords(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(id);
                    return newMap;
                });
            } else {
                // Ошибка - откатываем состояние
                const _deletedWord = deletedWords.get(id) || wordToDelete;
                if (onWordRemove) {
                    // Восстанавливаем слово через onWordRemove (но так как нет функции добавления, используем refetch)
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
            // Ошибка - откатываем состояние
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
        // Эта функция теперь просто открывает диалог подтверждения
        // Реальная логика будет в executeBulkDelete
    };

    const executeBulkDelete = async (
        selectedWords: (string | number)[],
        onWordRemove?: WordRemoveCallback,
        onWordsChange?: () => Promise<void>,
        onError?: (_message: string) => void,
    ): Promise<boolean> => {
        if (selectedWords.length === 0) return false;

        try {
            // Оптимистичное обновление - сразу удаляем из UI
            if (onWordRemove) {
                for (const wordId of selectedWords) {
                    onWordRemove(wordId);
                }
            }

            // Один запрос для всех слов
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
                // Ошибка - перезагружаем данные для отката
                console.error('Bulk delete failed');
                await onWordsChange?.();
                onError?.(t('Failed to delete words'));
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error deleting words:', error);
            // При ошибке перезагружаем данные
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
