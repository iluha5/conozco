'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Trash2,
    CheckCircle,
    CheckCircle2,
    X,
    Loader2,
    Square,
    CheckSquare,
    MinusSquare,
} from 'lucide-react';
import { useToast, usePartsOfSpeech } from '@/hooks/shared';
import { TranslationSelectorDialog } from '@/components/TranslationSelectorDialog';
import {
    getLanguageFlag,
    getPartOfSpeechAbbrev,
    getCurrentTranslation,
    getTranslationsCountText,
    hasTranslations,
} from '@/lib/word-utils';

// Кастомные хуки
import { useClientCheck } from './hooks/useClientCheck';
import { useWordSelection } from './hooks/useWordSelection';
import { useConfirmationDialogs } from './hooks/useConfirmationDialogs';
import { useWordTranslation } from './hooks/useWordTranslation';
import { useWordLoading } from './hooks/useWordLoading';
import { useWordStatus } from './hooks/useWordStatus';
import { useWordDeletion } from './hooks/useWordDeletion';

// Вспомогательные функции
import {
    getSelectionState,
    getBulkSelectText,
} from './helpers/selectionHelpers';

// Типы
import type { Word, WordsListProps } from './typing';

export function WordsList({
    words,
    onWordsChange,
    onWordUpdate,
    onWordRemove,
    showBulkActions = true,
    readOnly = false,
    emptyMessage = 'Слова не найдены',
}: WordsListProps) {
    // Кастомные хуки
    const { isClient } = useClientCheck();
    const selection = useWordSelection(words);
    const confirmations = useConfirmationDialogs();
    const translation = useWordTranslation();
    const loading = useWordLoading();
    const status = useWordStatus({ onWordUpdate, onWordsChange, readOnly });
    const deletion = useWordDeletion({ onWordRemove, onWordsChange, readOnly });

    const { toast } = useToast();
    const { partsOfSpeech } = usePartsOfSpeech('ru');

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
        await status.executeBulkStatusChange(
            selection.selectedWords,
            newStatus,
            onWordUpdate,
            onWordsChange,
        );

        const successCount = selection.selectedWords.length;
        toast({
            title: 'Успешно',
            description: `${successCount} слов ${newStatus === 'LEARNED' ? 'отмечено как выученные' : 'отмечено как невыученные'}`,
            variant: 'success',
        });
        selection.toggleAllWordsSelection(); // Сбросить выделение
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
        await deletion.executeBulkDelete(
            selection.selectedWords,
            onWordRemove,
            onWordsChange,
        );

        const successCount = selection.selectedWords.length;
        toast({
            title: 'Успешно',
            description: `${successCount} слов удалено`,
            variant: 'success',
        });
        selection.toggleAllWordsSelection(); // Сбросить выделение
        confirmations.handleCloseDeleteDialog();
    };

    if (words.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <p className="text-center text-gray-600">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Кнопки массового управления */}
            {showBulkActions && words.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={selection.toggleAllWordsSelection}
                            disabled={readOnly}
                        >
                            {(() => {
                                const state = getSelectionState(
                                    selection.selectedWords,
                                    words,
                                );
                                if (state === 'none') {
                                    return <Square className="mr-2 h-4 w-4" />;
                                } else if (state === 'all') {
                                    return (
                                        <CheckSquare className="mr-2 h-4 w-4" />
                                    );
                                } else {
                                    return (
                                        <MinusSquare className="mr-2 h-4 w-4" />
                                    );
                                }
                            })()}
                            {getBulkSelectText(
                                getSelectionState(
                                    selection.selectedWords,
                                    words,
                                ),
                            )}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            disabled={
                                selection.selectedWords.length === 0 || readOnly
                            }
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Удалить ({selection.selectedWords.length})
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleMarkAsLearned}
                            disabled={
                                selection.selectedWords.length === 0 || readOnly
                            }
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Выучено ({selection.selectedWords.length})
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                                handleBulkStatusChange('NOT_LEARNED')
                            }
                            disabled={
                                selection.selectedWords.length === 0 || readOnly
                            }
                        >
                            <X className="w-4 h-4 mr-2" />
                            Не выучено ({selection.selectedWords.length})
                        </Button>
                    </div>
                </div>
            )}

            {/* Список слов */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-[600px] overflow-y-auto p-2">
                {words.map(word => {
                    const isLoading = loading.isWordLoading(word.id);
                    const hasError = loading.hasWordError(word.id);
                    const optimisticWord = status.optimisticWords.get(word.id);
                    const displayWord = optimisticWord || word;

                    return (
                        <Card
                            key={word.id}
                            className={`transition-all relative ${
                                readOnly ? '' : 'cursor-pointer'
                            } m-1 ${
                                selection.isWordSelected(word.id)
                                    ? 'ring-2 ring-primary bg-blue-50'
                                    : 'hover:bg-gray-50'
                            } ${hasError ? 'animate-pulse-red-border' : ''}`}
                            onClick={() =>
                                !readOnly &&
                                selection.toggleWordSelection(word.id)
                            }
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {!readOnly && (
                                            <Checkbox
                                                checked={selection.isWordSelected(
                                                    word.id,
                                                )}
                                                onChange={() => {}}
                                                className="shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                                <span className="truncate">
                                                    {displayWord.baseWord
                                                        ?.word ||
                                                        displayWord.customWord}
                                                </span>
                                                <span className="text-sm shrink-0">
                                                    {getLanguageFlag(
                                                        displayWord.language
                                                            .code,
                                                    )}
                                                </span>
                                                {(() => {
                                                    // Приоритет: часть речи из кастомного перевода, затем из перевода
                                                    const customPartOfSpeech =
                                                        displayWord
                                                            .customTranslations?.[0]
                                                            ?.partOfSpeech;
                                                    const translationPartOfSpeech =
                                                        displayWord.baseWord
                                                            ?.translations?.[0]
                                                            ?.partOfSpeech;

                                                    const partOfSpeech =
                                                        customPartOfSpeech ||
                                                        translationPartOfSpeech;

                                                    // Не показываем плашку, если часть речи неизвестна
                                                    if (!partOfSpeech) {
                                                        return null;
                                                    }

                                                    return (
                                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">
                                                            {getPartOfSpeechAbbrev(
                                                                partOfSpeech.name,
                                                            )}
                                                        </span>
                                                    );
                                                })()}
                                            </CardTitle>
                                            <div className="flex items-center gap-1">
                                                <span
                                                    className={`truncate ${readOnly ? '' : 'cursor-pointer hover:text-blue-600'} transition-colors ${
                                                        hasTranslations(
                                                            displayWord.customTranslations,
                                                            displayWord.baseWord
                                                                ?.translations,
                                                        )
                                                            ? 'text-blue-500'
                                                            : 'text-gray-500'
                                                    }`}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        if (
                                                            !readOnly &&
                                                            displayWord.baseWord
                                                        ) {
                                                            translation.openTranslationDialog(
                                                                displayWord,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {getCurrentTranslation(
                                                        displayWord.customTranslations,
                                                        displayWord.baseWord
                                                            ?.translations,
                                                    )}
                                                </span>
                                                {hasTranslations(
                                                    displayWord.customTranslations,
                                                    displayWord.baseWord
                                                        ?.translations,
                                                ) && (
                                                    <span className="text-xs text-gray-400 shrink-0">
                                                        {getTranslationsCountText(
                                                            displayWord.baseWord
                                                                ?.translations
                                                                ?.length || 0,
                                                            !!(
                                                                displayWord.customTranslations &&
                                                                displayWord
                                                                    .customTranslations
                                                                    .length > 0
                                                            ),
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            {isClient &&
                                                translation.selectedWordForTranslation &&
                                                translation
                                                    .selectedWordForTranslation
                                                    .id === displayWord.id && (
                                                    <TranslationSelectorDialog
                                                        word={displayWord}
                                                        open={
                                                            translation
                                                                .translationDialogOpen[
                                                                displayWord.id
                                                            ] || false
                                                        }
                                                        onOpenChange={open =>
                                                            translation.handleDialogClose(
                                                                displayWord.id,
                                                                open,
                                                            )
                                                        }
                                                        onSave={async () => {
                                                            await onWordsChange?.();
                                                        }}
                                                        partsOfSpeech={
                                                            partsOfSpeech
                                                        }
                                                    />
                                                )}
                                        </div>
                                    </div>
                                    {!readOnly && (
                                        <div className="flex gap-1 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleToggleStatus(word);
                                                }}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                                ) : displayWord.status ===
                                                  'LEARNED' ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleDeleteWord(word.id);
                                                }}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>

            {/* Диалог подтверждения удаления */}
            <Dialog
                open={confirmations.confirmDeleteDialogOpen}
                onOpenChange={confirmations.setDeleteDialogOpen}
            >
                <DialogContent className="mx-4 sm:mx-6">
                    <DialogHeader>
                        <DialogTitle>Подтверждение удаления</DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите удалить{' '}
                            {selection.selectedWords.length} слов(а)? Это
                            действие нельзя отменить.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={confirmations.handleCloseDeleteDialog}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={executeBulkDelete}
                        >
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог подтверждения изменения статуса */}
            <Dialog
                open={confirmations.confirmStatusDialogOpen}
                onOpenChange={confirmations.setStatusDialogOpen}
            >
                <DialogContent>
                    {/*<DialogContent className="mx-4 sm:mx-6">*/}
                    <DialogHeader>
                        <DialogTitle>
                            Подтверждение изменения статуса
                        </DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите отметить{' '}
                            {selection.selectedWords.length} слов(а) как{' '}
                            {confirmations.pendingStatusAction === 'LEARNED'
                                ? 'выученные'
                                : 'невыученные'}
                            ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={confirmations.handleCloseStatusDialog}
                        >
                            Отмена
                        </Button>
                        <Button onClick={executeBulkStatusChange}>
                            Подтвердить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
