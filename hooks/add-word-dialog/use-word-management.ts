import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import { wordsApi } from '@/lib/api/words.api';
import type { BaseWord, SelectedWord } from '@/types/add-word-dialog.types';
import type { WordChangedEvent, WordListItem } from '@/types/words.types';

type UseWordManagementProps = {
    availableWords: BaseWord[];
    setAvailableWords: React.Dispatch<React.SetStateAction<BaseWord[]>>;
    onWordChanged: (_change: WordChangedEvent) => void;
};

function normalizeWordId(id: string | number): string {
    return String(id);
}

function findWordById(words: BaseWord[], baseWordId: string | number) {
    const normalizedId = normalizeWordId(baseWordId);
    return words.find(word => normalizeWordId(word.id) === normalizedId);
}

export function useWordManagement({
    availableWords,
    setAvailableWords,
    onWordChanged,
}: UseWordManagementProps) {
    const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([]);
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);
    const { toast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        setSelectedWords(
            availableWords
                .filter(word => word.isAddedByUser)
                .map(word => normalizeWordId(word.id)),
        );
    }, [availableWords]);

    const addWord = async (baseWordId: string | number) => {
        const normalizedBaseWordId = normalizeWordId(baseWordId);

        try {
            const response = await fetch('/api/words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    baseWordId: normalizedBaseWordId,
                }),
            });

            if (response.ok) {
                const createdWord = (await response.json()) as WordListItem;
                const baseWord = findWordById(
                    availableWords,
                    normalizedBaseWordId,
                );
                setAvailableWords(prev =>
                    prev.map(word =>
                        normalizeWordId(word.id) === normalizedBaseWordId
                            ? {
                                  ...word,
                                  isAddedByUser: true,
                                  userWordId: createdWord.id,
                              }
                            : word,
                    ),
                );
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

    const removeWord = async (baseWordId: string | number) => {
        const normalizedBaseWordId = normalizeWordId(baseWordId);

        try {
            const word = findWordById(availableWords, normalizedBaseWordId);
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
                        normalizeWordId(w.id) === normalizedBaseWordId
                            ? {
                                  ...w,
                                  isAddedByUser: false,
                                  userWordId: null,
                              }
                            : w,
                    ),
                );
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

    const toggleWordSelection = async (baseWordId: string | number) => {
        const word = findWordById(availableWords, baseWordId);
        if (!word) return;

        if (word.isAddedByUser) {
            await removeWord(baseWordId);
        } else {
            await addWord(baseWordId);
        }
    };

    const buildWordGroupIdsByBaseWordId = (words: BaseWord[]) => {
        return words.reduce<Record<string, number[]>>((acc, word) => {
            if (word.wordGroups?.length) {
                acc[normalizeWordId(word.id)] = word.wordGroups.map(
                    group => group.wordGroupId,
                );
            }
            return acc;
        }, {});
    };

    const selectAllWords = async (filteredWords: BaseWord[]) => {
        const wordsToAdd = filteredWords.filter(word => !word.isAddedByUser);

        if (wordsToAdd.length === 0) {
            return;
        }

        setIsBulkProcessing(true);

        try {
            const result = await wordsApi.bulkAddWordsFromDictionary(
                wordsToAdd.map(word => Number(word.id)),
            );

            if (result.created === 0) {
                return;
            }

            const userWordIdByBaseWordId = new Map(
                result.items
                    .filter(item => item.baseWordId !== undefined)
                    .map(item => [
                        normalizeWordId(item.baseWordId as number),
                        item.id,
                    ]),
            );

            setAvailableWords(prev =>
                prev.map(word => {
                    const userWordId = userWordIdByBaseWordId.get(
                        normalizeWordId(word.id),
                    );
                    if (!userWordId) {
                        return word;
                    }

                    return {
                        ...word,
                        isAddedByUser: true,
                        userWordId,
                    };
                }),
            );

            onWordChanged({
                action: 'add-bulk',
                items: result.items,
                wordGroupIdsByBaseWordId:
                    buildWordGroupIdsByBaseWordId(wordsToAdd),
            });

            toast({
                title: t('Success'),
                description: t('{{count}} words added', {
                    count: result.created,
                }),
            });
        } catch (error) {
            console.error('Error bulk adding words:', error);
            toast({
                title: t('Error'),
                description: t('Failed to add word'),
                variant: 'destructive',
            });
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const deselectAllWords = async (filteredWords: BaseWord[]) => {
        const wordsToRemove = filteredWords.filter(
            word => word.isAddedByUser && word.userWordId,
        );

        if (wordsToRemove.length === 0) {
            return;
        }

        const userWordIds = wordsToRemove
            .map(word => word.userWordId)
            .filter((id): id is number => id !== null && id !== undefined);

        setIsBulkProcessing(true);

        try {
            const result = await wordsApi.bulkRemoveWords(userWordIds);

            if (result.deleted === 0) {
                return;
            }

            const removedBaseWordIds = new Set(
                wordsToRemove.map(word => normalizeWordId(word.id)),
            );

            setAvailableWords(prev =>
                prev.map(word =>
                    removedBaseWordIds.has(normalizeWordId(word.id))
                        ? {
                              ...word,
                              isAddedByUser: false,
                              userWordId: null,
                          }
                        : word,
                ),
            );

            onWordChanged({
                action: 'remove-bulk',
                wordIds: userWordIds,
            });

            toast({
                title: t('Success'),
                description: t('{{count}} words removed', {
                    count: result.deleted,
                }),
            });
        } catch (error) {
            console.error('Error bulk removing words:', error);
            toast({
                title: t('Error'),
                description: t('Failed to delete word'),
                variant: 'destructive',
            });
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const toggleAllWordsSelection = async (filteredWords: BaseWord[]) => {
        const allAdded = filteredWords.every(word => word.isAddedByUser);

        if (allAdded) {
            await deselectAllWords(filteredWords);
        } else {
            await selectAllWords(filteredWords);
        }
    };

    const isWordSelected = (baseWordId: string | number) => {
        return findWordById(availableWords, baseWordId)?.isAddedByUser ?? false;
    };

    const resetSelection = () => {
        setSelectedWords([]);
    };

    return {
        selectedWords,
        isBulkProcessing,
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
