import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import type { BaseWord, SelectedWord } from '@/types/add-word-dialog.types';
import type { WordChangedEvent, WordListItem } from '@/types/words.types';

type UseWordManagementProps = {
    availableWords: BaseWord[];
    setAvailableWords: React.Dispatch<React.SetStateAction<BaseWord[]>>;
    onWordChanged: (_change: WordChangedEvent) => void;
};

export function useWordManagement({
    availableWords,
    setAvailableWords,
    onWordChanged,
}: UseWordManagementProps) {
    const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([]);
    const { toast } = useToast();
    const { t } = useTranslation();

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
                const createdWord = (await response.json()) as WordListItem;
                const baseWord = availableWords.find(w => w.id === baseWordId);
                setAvailableWords(prev =>
                    prev.map(w =>
                        w.id === baseWordId
                            ? {
                                  ...w,
                                  isAddedByUser: true,
                                  userWordId: createdWord.id,
                              }
                            : w,
                    ),
                );
                setSelectedWords(prev => [...prev, baseWordId]);
                onWordChanged({
                    action: 'add',
                    item: createdWord,
                    wordGroupIds: baseWord?.wordGroups?.map(
                        group => group.wordGroupId,
                    ),
                });
                return true;
            } else {
                toast({
                    title: t('Error'),
                    description: t('Failed to add word'),
                    variant: 'destructive',
                });
                return false;
            }
        } catch (error) {
            console.error('Error adding word:', error);
            toast({
                title: t('Error'),
                description: t('Failed to add word'),
                variant: 'destructive',
            });
            return false;
        }
    };

    const removeWord = async (baseWordId: string) => {
        try {
            const word = availableWords.find(w => w.id === baseWordId);
            const userWordId = word?.userWordId;

            if (!userWordId) {
                toast({
                    title: t('Error'),
                    description: t('Failed to delete word'),
                    variant: 'destructive',
                });
                return false;
            }

            const response = await fetch(`/api/words/${userWordId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setAvailableWords(prev =>
                    prev.map(w =>
                        w.id === baseWordId
                            ? {
                                  ...w,
                                  isAddedByUser: false,
                                  userWordId: null,
                              }
                            : w,
                    ),
                );
                setSelectedWords(prev => prev.filter(id => id !== baseWordId));
                onWordChanged({ action: 'remove', wordId: userWordId });
                return true;
            }

            toast({
                title: t('Error'),
                description: t('Failed to delete word'),
                variant: 'destructive',
            });
            return false;
        } catch (error) {
            console.error('Error removing word:', error);
            toast({
                title: t('Error'),
                description: t('Failed to delete word'),
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
                title: t('Success'),
                description: t('{{count}} words added', { count: addedCount }),
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
                title: t('Success'),
                description: t('{{count}} words removed', {
                    count: removedCount,
                }),
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
