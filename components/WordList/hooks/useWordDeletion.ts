import { useState } from 'react';
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
    ) => {
        let successCount = 0;
        let _errorCount = 0;

        try {
            for (const wordId of selectedWords) {
                const response = await fetch(`/api/words/${wordId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    successCount++;
                    // Удаляем слово из состояния, если есть callback
                    if (onWordRemove) {
                        onWordRemove(wordId);
                    }
                } else {
                    _errorCount++;
                }
            }

            if (successCount > 0) {
                // Перезагружаем только если нет callback для удаления
                if (!onWordRemove) {
                    await onWordsChange?.();
                }
            }
        } catch (error) {
            console.error('Error deleting words:', error);
        }
    };

    return {
        deletedWords,
        handleDeleteWord,
        handleBulkDelete,
        executeBulkDelete,
    };
}
