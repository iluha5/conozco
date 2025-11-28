import { useState } from 'react';
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
    const [optimisticWords, setOptimisticWords] = useState<
        Map<string | number, Word>
    >(new Map());

    const handleToggleStatus = async (word: Word) => {
        if (readOnly) return;

        const newStatus = word.status === 'LEARNED' ? 'NOT_LEARNED' : 'LEARNED';

        // Сохраняем старое состояние для отката
        const oldWord = { ...word };

        // Оптимистичное обновление - сразу меняем статус
        if (onWordUpdate) {
            onWordUpdate(word.id, { status: newStatus });
        }

        // Сохраняем оптимистичное состояние
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
                // Успешно обновлено, ничего не делаем (уже обновлено оптимистично)
            } else {
                // Ошибка - откатываем состояние
                if (onWordUpdate) {
                    onWordUpdate(word.id, { status: oldWord.status });
                } else {
                    await onWordsChange?.();
                }
                // Удаляем из оптимистичных
                setOptimisticWords(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(word.id);
                    return newMap;
                });
            }
        } catch (error) {
            console.error('Error updating word:', error);
            // Ошибка - откатываем состояние
            if (onWordUpdate) {
                onWordUpdate(word.id, { status: oldWord.status });
            } else {
                await onWordsChange?.();
            }
            // Удаляем из оптимистичных
            setOptimisticWords(prev => {
                const newMap = new Map(prev);
                newMap.delete(word.id);
                return newMap;
            });
        }
    };

    const handleBulkStatusChange = (_newStatus: 'LEARNED' | 'NOT_LEARNED') => {
        if (readOnly) return;

        // Эта функция теперь просто открывает диалог подтверждения
        // Реальная логика будет в executeBulkStatusChange
    };

    const executeBulkStatusChange = async (
        selectedWords: (string | number)[],
        _newStatus: 'LEARNED' | 'NOT_LEARNED',
        onWordUpdate?: WordUpdateCallback,
        onWordsChange?: () => Promise<void>,
    ) => {
        let successCount = 0;
        let _errorCount = 0;

        try {
            for (const wordId of selectedWords) {
                const response = await fetch(`/api/words/${wordId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: _newStatus }),
                });

                if (response.ok) {
                    successCount++;
                    // Обновляем состояние отдельного слова, если есть callback
                    if (onWordUpdate) {
                        onWordUpdate(wordId, { status: _newStatus });
                    }
                } else {
                    _errorCount++;
                }
            }

            if (successCount > 0) {
                // Перезагружаем только если нет callback для обновления
                if (!onWordUpdate) {
                    await onWordsChange?.();
                }
            }
        } catch (error) {
            console.error('Error updating words status:', error);
        }
    };

    const handleMarkAsLearned = () => {
        // Эта функция открывает диалог подтверждения для статуса LEARNED
    };

    return {
        optimisticWords,
        handleToggleStatus,
        handleBulkStatusChange,
        executeBulkStatusChange,
        handleMarkAsLearned,
    };
}
