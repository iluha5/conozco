'use client';

import { useState } from 'react';
import { useToast, usePartsOfSpeech } from '@/hooks/shared';
// Кастомные хуки
import { useClientCheck } from './hooks/useClientCheck';
import { useWordSelection } from './hooks/useWordSelection';
import { useConfirmationDialogs } from './hooks/useConfirmationDialogs';
import { useWordTranslation } from './hooks/useWordTranslation';
import { useWordLoading } from './hooks/useWordLoading';
import { useWordStatus } from './hooks/useWordStatus';
import { useWordDeletion } from './hooks/useWordDeletion';

// Типы
import type { Word, WordsListProps } from './typing';

// Компоненты
import { EmptyState } from './components/EmptyState';
import { BulkActions } from './components/BulkActions';
import { WordItem } from './components/WordItem';
import { ConfirmationDialogs } from './components/ConfirmationDialogs';

export function WordsList({
    words,
    onWordsChange,
    onWordUpdate,
    onWordRemove,
    showBulkActions = true,
    readOnly = false,
    emptyMessage = 'Слова не найдены',
    externalSelection,
    hideSelectAllButton = false,
}: WordsListProps) {
    // Состояния загрузки для bulk операций
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Кастомные хуки
    const { isClient } = useClientCheck();
    const internalSelection = useWordSelection(words);
    const selection = externalSelection || internalSelection;
    const confirmations = useConfirmationDialogs();
    const translation = useWordTranslation();
    const loading = useWordLoading();
    const status = useWordStatus({ onWordUpdate, onWordsChange, readOnly });
    const deletion = useWordDeletion({ onWordRemove, onWordsChange, readOnly });
    const { partsOfSpeech } = usePartsOfSpeech('ru');

    const { toast } = useToast();

    // Обработчики событий с использованием хуков
    const handleDeleteWord = async (id: string | number) => {
        await deletion.handleDeleteWord(id, words);
    };

    const handleToggleStatus = async (word: Word) => {
        await status.handleToggleStatus(word);
    };

    const handleMarkAsLearned = () => {
        confirmations.openStatusConfirmation('LEARNED');
    };

    const handleBulkStatusChange = (newStatus: 'LEARNED' | 'NOT_LEARNED') => {
        if (selection.selectedWords.length === 0) {
            toast({
                title: 'Ошибка',
                description: 'Выберите слова для изменения статуса',
                variant: 'destructive',
            });
            return;
        }
        confirmations.openStatusConfirmation(newStatus);
    };

    const executeBulkStatusChange = async () => {
        if (!confirmations.pendingStatusAction) return;

        const newStatus = confirmations.pendingStatusAction;
        const successCount = selection.selectedWords.length;

        setIsUpdatingStatus(true);

        const success = await status.executeBulkStatusChange(
            selection.selectedWords,
            newStatus,
            onWordUpdate,
            onWordsChange,
            errorMessage => {
                toast({
                    title: 'Ошибка',
                    description: errorMessage,
                    variant: 'destructive',
                });
            },
        );

        setIsUpdatingStatus(false);

        if (success) {
            toast({
                title: 'Успешно',
                description: `${successCount} слов ${newStatus === 'LEARNED' ? 'отмечено как выученные' : 'отмечено как невыученные'}`,
                variant: 'success',
            });
        }

        selection.clearSelection();
        confirmations.closeStatusConfirmation();
    };

    const handleBulkDelete = () => {
        if (selection.selectedWords.length === 0) {
            toast({
                title: 'Ошибка',
                description: 'Выберите слова для удаления',
                variant: 'destructive',
            });
            return;
        }
        confirmations.openDeleteConfirmation();
    };

    const executeBulkDelete = async () => {
        const successCount = selection.selectedWords.length;

        setIsDeleting(true);

        const success = await deletion.executeBulkDelete(
            selection.selectedWords,
            onWordRemove,
            onWordsChange,
            errorMessage => {
                toast({
                    title: 'Ошибка',
                    description: errorMessage,
                    variant: 'destructive',
                });
            },
        );

        setIsDeleting(false);

        if (success) {
            toast({
                title: 'Успешно',
                description: `${successCount} слов удалено`,
                variant: 'success',
            });
        }

        selection.clearSelection();
        confirmations.handleCloseDeleteDialog();
    };

    if (words.length === 0) {
        return <EmptyState message={emptyMessage} />;
    }

    return (
        <div className="space-y-4">
            {/* Кнопки массового управления */}
            {showBulkActions && words.length > 0 && (
                <BulkActions
                    words={words}
                    selectedWords={selection.selectedWords}
                    onToggleAllSelection={selection.toggleAllWordsSelection}
                    onMarkAsLearned={handleMarkAsLearned}
                    onChangeStatus={handleBulkStatusChange}
                    onDelete={handleBulkDelete}
                    readOnly={readOnly}
                    hideSelectAllButton={hideSelectAllButton}
                />
            )}

            {/* Список слов */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-[400px] overflow-y-auto p-2">
                {words.map(word => {
                    const isLoading = loading.isWordLoading(word.id);
                    const hasError = loading.hasWordError(word.id);
                    const optimisticWord = status.optimisticWords.get(word.id);

                    return (
                        <WordItem
                            key={word.id}
                            word={word}
                            isSelected={selection.isWordSelected(word.id)}
                            isLoading={isLoading}
                            hasError={hasError}
                            optimisticWord={optimisticWord}
                            isClient={isClient}
                            translationDialogOpen={
                                translation.translationDialogOpen
                            }
                            selectedWordForTranslation={
                                translation.selectedWordForTranslation
                            }
                            partsOfSpeech={partsOfSpeech}
                            onToggleSelection={selection.toggleWordSelection}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDeleteWord}
                            onOpenTranslation={
                                translation.openTranslationDialog
                            }
                            onCloseTranslation={translation.handleDialogClose}
                            onTranslationSave={async () => {
                                await onWordsChange?.();
                            }}
                            readOnly={readOnly}
                        />
                    );
                })}
            </div>

            <ConfirmationDialogs
                deleteDialogOpen={confirmations.confirmDeleteDialogOpen}
                statusDialogOpen={confirmations.confirmStatusDialogOpen}
                pendingStatusAction={confirmations.pendingStatusAction}
                selectedWordsCount={selection.selectedWords.length}
                isDeleting={isDeleting}
                isUpdatingStatus={isUpdatingStatus}
                onCloseDeleteDialog={confirmations.handleCloseDeleteDialog}
                onCloseStatusDialog={confirmations.handleCloseStatusDialog}
                onConfirmDelete={executeBulkDelete}
                onConfirmStatus={executeBulkStatusChange}
            />
        </div>
    );
}
