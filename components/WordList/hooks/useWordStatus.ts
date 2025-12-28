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
        newStatus: 'LEARNED' | 'NOT_LEARNED',
        onWordUpdate?: WordUpdateCallback,
        onWordsChange?: () => Promise<void>,
        onError?: (_message: string) => void,
    ): Promise<boolean> => {
        if (selectedWords.length === 0) return false;

        try {
            // Оптимистичное обновление - сразу обновляем UI
            if (onWordUpdate) {
                for (const wordId of selectedWords) {
                    onWordUpdate(wordId, { status: newStatus });
                }
            }

            // Один запрос для всех слов
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
                // Ошибка - перезагружаем данные для отката
                console.error('Bulk status update failed');
                await onWordsChange?.();
                onError?.(t('Failed to change word status'));
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error updating words status:', error);
            // При ошибке перезагружаем данные
            await onWordsChange?.();
            onError?.(t('An error occurred while changing word status'));
            return false;
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
