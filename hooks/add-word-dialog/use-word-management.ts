/**
 * Хук для управления словами (добавление/удаление)
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/shared';
import type { BaseWord, SelectedWord } from '@/types/add-word-dialog.types';

type UseWordManagementProps = {
    availableWords: BaseWord[];
    setAvailableWords: React.Dispatch<React.SetStateAction<BaseWord[]>>;
    onWordAdded: () => void;
};

export function useWordManagement({
    availableWords,
    setAvailableWords,
    onWordAdded,
}: UseWordManagementProps) {
    const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([]);
    const { toast } = useToast();

    // Автоматически выбираем слова, уже добавленные пользователем
    useEffect(() => {
        const addedWords = availableWords
            .filter(word => word.isAddedByUser)
            .map(word => word.id);
        setSelectedWords(prev => {
            const combinedSet = new Set([...prev, ...addedWords]);
            return Array.from(combinedSet);
        });
    }, [availableWords]);

    const addWord = async (baseWordId: string) => {
        try {
            const response = await fetch('/api/words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    baseWordId: baseWordId,
                }),
            });

            if (response.ok) {
                setAvailableWords(prev =>
                    prev.map(w =>
                        w.id === baseWordId ? { ...w, isAddedByUser: true } : w,
                    ),
                );
                setSelectedWords(prev => [...prev, baseWordId]);
                onWordAdded();
                return true;
            } else {
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось добавить слово',
                    variant: 'destructive',
                });
                return false;
            }
        } catch (error) {
            console.error('Error adding word:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось добавить слово',
                variant: 'destructive',
            });
            return false;
        }
    };

    const removeWord = async (baseWordId: string) => {
        try {
            const userWordsResponse = await fetch('/api/words');
            if (userWordsResponse.ok) {
                const userWords = await userWordsResponse.json();
                const userWord = userWords.find(
                    (w: any) => w.baseWordId === baseWordId,
                );

                if (userWord) {
                    const response = await fetch(`/api/words/${userWord.id}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        setAvailableWords(prev =>
                            prev.map(w =>
                                w.id === baseWordId
                                    ? { ...w, isAddedByUser: false }
                                    : w,
                            ),
                        );
                        setSelectedWords(prev =>
                            prev.filter(id => id !== baseWordId),
                        );
                        onWordAdded();
                        return true;
                    }
                }
            }

            toast({
                title: 'Ошибка',
                description: 'Не удалось удалить слово',
                variant: 'destructive',
            });
            return false;
        } catch (error) {
            console.error('Error removing word:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось удалить слово',
                variant: 'destructive',
            });
            return false;
        }
    };

    const toggleWordSelection = async (baseWordId: string) => {
        const word = availableWords.find(w => w.id === baseWordId);
        if (!word) return;

        if (word.isAddedByUser) {
            await removeWord(baseWordId);
        } else {
            await addWord(baseWordId);
        }
    };

    const selectAllWords = async (filteredWords: BaseWord[]) => {
        let addedCount = 0;

        for (const word of filteredWords) {
            if (!word.isAddedByUser) {
                const success = await addWord(word.id);
                if (success) addedCount++;
            }
        }

        if (addedCount > 0) {
            toast({
                title: 'Успешно',
                description: `Добавлено слов: ${addedCount}`,
            });
        }
    };

    const deselectAllWords = async (filteredWords: BaseWord[]) => {
        let removedCount = 0;

        for (const word of filteredWords) {
            if (word.isAddedByUser) {
                const success = await removeWord(word.id);
                if (success) removedCount++;
            }
        }

        if (removedCount > 0) {
            toast({
                title: 'Успешно',
                description: `Удалено слов: ${removedCount}`,
            });
        }
    };

    const toggleAllWordsSelection = async (filteredWords: BaseWord[]) => {
        const allSelected = filteredWords.every(word =>
            selectedWords.includes(word.id),
        );

        if (allSelected) {
            await deselectAllWords(filteredWords);
        } else {
            await selectAllWords(filteredWords);
        }
    };

    const isWordSelected = (baseWordId: string) => {
        return selectedWords.includes(baseWordId);
    };

    const resetSelection = () => {
        setSelectedWords([]);
    };

    return {
        selectedWords,
        addWord,
        removeWord,
        toggleWordSelection,
        selectAllWords,
        deselectAllWords,
        toggleAllWordsSelection,
        isWordSelected,
        resetSelection,
    };
}
