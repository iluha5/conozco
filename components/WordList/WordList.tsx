'use client';

import { useState, useEffect } from 'react';
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

type Language = {
    id: string | number;
    code: string;
    name: string;
};

type Word = {
    id: string | number;
    userId: string | number;
    baseWordId?: string | number;
    customWord?: string;
    languageId: string | number;
    language: Language;
    status: 'NOT_LEARNED' | 'LEARNED';
    createdAt: string;
    updatedAt: string;
    baseWord?: {
        id: string | number;
        word: string;
        languageId: string | number;
        translations: Array<{
            translation: string;
            priority: number;
            partOfSpeech?: {
                id: string | number;
                name: string;
                displayName: string;
            };
        }>;
        examples?: Array<any>;
        grammaticalExamples?: Array<any>;
    };
    customTranslations?: Array<{
        id: number;
        translation: string;
        partOfSpeech?: {
            id: number;
            name: string;
            displayName: string;
        };
        partOfSpeechId?: number | null;
        originalLanguage: Language;
        translationLanguage: Language;
    }>;
    trainingSessions?: Array<any>;
};

type WordUpdateCallback = (
    _wordId: string | number,
    _updates: Partial<Word>,
) => void;

type WordRemoveCallback = (_wordId: string | number) => void;

type WordsListProps = {
    words: Word[];
    onWordsChange?: () => Promise<void>;
    onWordUpdate?: WordUpdateCallback;
    onWordRemove?: WordRemoveCallback;
    showBulkActions?: boolean;
    readOnly?: boolean;
    emptyMessage?: string;
};

export function WordsList({
    words,
    onWordsChange,
    onWordUpdate,
    onWordRemove,
    showBulkActions = true,
    readOnly = false,
    emptyMessage = 'Слова не найдены',
}: WordsListProps) {
    const [selectedWords, setSelectedWords] = useState<(string | number)[]>([]);
    const [translationDialogOpen, setTranslationDialogOpen] = useState<{
        [key: string | number]: boolean;
    }>({});
    const [selectedWordForTranslation, setSelectedWordForTranslation] =
        useState<Word | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [loadingWords, setLoadingWords] = useState<Set<string | number>>(
        new Set(),
    );
    const [errorWords, setErrorWords] = useState<Set<string | number>>(
        new Set(),
    );
    const [optimisticWords, setOptimisticWords] = useState<
        Map<string | number, Word>
    >(new Map());
    const [deletedWords, setDeletedWords] = useState<
        Map<string | number, Word>
    >(new Map());
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] =
        useState(false);
    const [confirmStatusDialogOpen, setConfirmStatusDialogOpen] =
        useState(false);
    const [pendingStatusAction, setPendingStatusAction] = useState<
        'LEARNED' | 'NOT_LEARNED' | null
    >(null);
    const { toast } = useToast();
    const { partsOfSpeech } = usePartsOfSpeech('ru');

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Сбрасываем выделение при изменении списка слов
        setSelectedWords([]);
    }, [words]);

    const handleDeleteWord = async (id: string | number) => {
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

        // Устанавливаем состояние загрузки
        setLoadingWords(prev => new Set(prev).add(id));
        setErrorWords(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });

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
                const deletedWord = deletedWords.get(id) || wordToDelete;
                if (onWordUpdate && deletedWord) {
                    // Восстанавливаем слово через onWordUpdate
                    // Но так как нет функции добавления, используем refetch
                    await onWordsChange?.();
                } else {
                    await onWordsChange?.();
                }
                setDeletedWords(prev => {
                    const newMap = new Map(prev);
                    newMap.delete(id);
                    return newMap;
                });
                // Показываем анимацию ошибки
                setErrorWords(prev => new Set(prev).add(id));
                setTimeout(() => {
                    setErrorWords(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(id);
                        return newSet;
                    });
                }, 2000);
            }
        } catch (error) {
            console.error('Error deleting word:', error);
            // Ошибка - откатываем состояние
            const deletedWord = deletedWords.get(id) || wordToDelete;
            if (onWordUpdate && deletedWord) {
                await onWordsChange?.();
            } else {
                await onWordsChange?.();
            }
            setDeletedWords(prev => {
                const newMap = new Map(prev);
                newMap.delete(id);
                return newMap;
            });
            // Показываем анимацию ошибки
            setErrorWords(prev => new Set(prev).add(id));
            setTimeout(() => {
                setErrorWords(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            }, 2000);
        } finally {
            setLoadingWords(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

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

        // Устанавливаем состояние загрузки
        setLoadingWords(prev => new Set(prev).add(word.id));
        setErrorWords(prev => {
            const newSet = new Set(prev);
            newSet.delete(word.id);
            return newSet;
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
                // Показываем анимацию ошибки
                setErrorWords(prev => new Set(prev).add(word.id));
                setTimeout(() => {
                    setErrorWords(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(word.id);
                        return newSet;
                    });
                }, 2000);
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
            // Показываем анимацию ошибки
            setErrorWords(prev => new Set(prev).add(word.id));
            setTimeout(() => {
                setErrorWords(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(word.id);
                    return newSet;
                });
            }, 2000);
        } finally {
            setLoadingWords(prev => {
                const newSet = new Set(prev);
                newSet.delete(word.id);
                return newSet;
            });
        }
    };

    const toggleWordSelection = (wordId: string | number) => {
        setSelectedWords(prev =>
            prev.includes(wordId)
                ? prev.filter(id => id !== wordId)
                : [...prev, wordId],
        );
    };

    const _selectAllWords = () => {
        setSelectedWords(words.map(word => word.id));
    };

    const _deselectAllWords = () => {
        setSelectedWords([]);
    };

    const toggleAllWordsSelection = () => {
        const allSelected = selectedWords.length === words.length;
        if (allSelected) {
            setSelectedWords([]);
        } else {
            setSelectedWords(words.map(word => word.id));
        }
    };

    const getBulkSelectIcon = () => {
        const allSelected = selectedWords.length === words.length;
        const hasSelection = selectedWords.length > 0;
        if (!hasSelection) {
            return <Square className="mr-2 h-4 w-4" />;
        } else if (allSelected) {
            return <CheckSquare className="mr-2 h-4 w-4" />;
        } else {
            return <MinusSquare className="mr-2 h-4 w-4" />;
        }
    };

    const getBulkSelectText = () => {
        return selectedWords.length === words.length
            ? 'Снять все'
            : 'Выбрать все';
    };

    const handleMarkAsLearned = () => {
        handleBulkStatusChange('LEARNED');
    };

    const handleCloseDeleteDialog = () => {
        setConfirmDeleteDialogOpen(false);
    };

    const handleCloseStatusDialog = () => {
        setConfirmStatusDialogOpen(false);
    };

    const isWordSelected = (wordId: string | number) => {
        return selectedWords.includes(wordId);
    };

    const openTranslationDialog = (word: Word) => {
        if (readOnly) return;
        setSelectedWordForTranslation(word);
        setTranslationDialogOpen({ ...translationDialogOpen, [word.id]: true });
    };

    const handleDialogClose = (wordId: string | number, open: boolean) => {
        setTranslationDialogOpen(prev => ({
            ...prev,
            [wordId]: open,
        }));
        if (!open) {
            setSelectedWordForTranslation(null);
        }
    };

    const handleBulkStatusChange = (newStatus: 'LEARNED' | 'NOT_LEARNED') => {
        if (readOnly) return;

        if (selectedWords.length === 0) {
            toast({
                title: 'Ошибка',
                description: 'Выберите слова для изменения статуса',
                variant: 'destructive',
            });
            return;
        }

        setPendingStatusAction(newStatus);
        setConfirmStatusDialogOpen(true);
    };

    const executeBulkStatusChange = async () => {
        if (!pendingStatusAction) return;

        const newStatus = pendingStatusAction;
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const wordId of selectedWords) {
                const response = await fetch(`/api/words/${wordId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus }),
                });

                if (response.ok) {
                    successCount++;
                    // Обновляем состояние отдельного слова, если есть callback
                    if (onWordUpdate) {
                        onWordUpdate(wordId, { status: newStatus });
                    }
                } else {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                toast({
                    title: 'Успешно',
                    description: `${successCount} слов ${newStatus === 'LEARNED' ? 'отмечено как выученные' : 'отмечено как невыученные'}${errorCount > 0 ? `, ${errorCount} ошибок` : ''}`,
                    variant: 'success',
                });
                setSelectedWords([]);
                // Перезагружаем только если нет callback для обновления
                if (!onWordUpdate) {
                    await onWordsChange?.();
                }
            } else {
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось изменить статус ни одного слова',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error updating words status:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось изменить статус слов',
                variant: 'destructive',
            });
        } finally {
            setConfirmStatusDialogOpen(false);
            setPendingStatusAction(null);
        }
    };

    const handleBulkDelete = () => {
        if (readOnly) return;

        if (selectedWords.length === 0) {
            toast({
                title: 'Ошибка',
                description: 'Выберите слова для удаления',
                variant: 'destructive',
            });
            return;
        }

        setConfirmDeleteDialogOpen(true);
    };

    const executeBulkDelete = async () => {
        let successCount = 0;
        let errorCount = 0;

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
                    errorCount++;
                }
            }

            if (successCount > 0) {
                toast({
                    title: 'Успешно',
                    description: `${successCount} слов удалено${errorCount > 0 ? `, ${errorCount} ошибок` : ''}`,
                    variant: 'success',
                });
                setSelectedWords([]);
                // Перезагружаем только если нет callback для удаления
                if (!onWordRemove) {
                    await onWordsChange?.();
                }
            } else {
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось удалить ни одно слово',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error deleting words:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось удалить слова',
                variant: 'destructive',
            });
        } finally {
            setConfirmDeleteDialogOpen(false);
        }
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
                            onClick={toggleAllWordsSelection}
                            disabled={readOnly}
                        >
                            {getBulkSelectIcon()}
                            {getBulkSelectText()}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                            disabled={selectedWords.length === 0 || readOnly}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Удалить ({selectedWords.length})
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleMarkAsLearned}
                            disabled={selectedWords.length === 0 || readOnly}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Выучено ({selectedWords.length})
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                                handleBulkStatusChange('NOT_LEARNED')
                            }
                            disabled={selectedWords.length === 0 || readOnly}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Не выучено ({selectedWords.length})
                        </Button>
                    </div>
                </div>
            )}

            {/* Список слов */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-[600px] overflow-y-auto p-2">
                {words.map(word => {
                    const isLoading = loadingWords.has(word.id);
                    const hasError = errorWords.has(word.id);
                    const optimisticWord = optimisticWords.get(word.id);
                    const displayWord = optimisticWord || word;

                    return (
                        <Card
                            key={word.id}
                            className={`transition-all relative ${
                                readOnly ? '' : 'cursor-pointer'
                            } m-1 ${
                                isWordSelected(word.id)
                                    ? 'ring-2 ring-primary bg-blue-50'
                                    : 'hover:bg-gray-50'
                            } ${hasError ? 'animate-pulse-red-border' : ''}`}
                            onClick={() =>
                                !readOnly && toggleWordSelection(word.id)
                            }
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {!readOnly && (
                                            <Checkbox
                                                checked={isWordSelected(
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
                                                            openTranslationDialog(
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
                                                selectedWordForTranslation &&
                                                selectedWordForTranslation.id ===
                                                    displayWord.id && (
                                                    <TranslationSelectorDialog
                                                        word={displayWord}
                                                        open={
                                                            translationDialogOpen[
                                                                displayWord.id
                                                            ] || false
                                                        }
                                                        onOpenChange={open =>
                                                            handleDialogClose(
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
                open={confirmDeleteDialogOpen}
                onOpenChange={setConfirmDeleteDialogOpen}
            >
                <DialogContent className="mx-4 sm:mx-6">
                    <DialogHeader>
                        <DialogTitle>Подтверждение удаления</DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите удалить{' '}
                            {selectedWords.length} слов(а)? Это действие нельзя
                            отменить.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={handleCloseDeleteDialog}
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
                open={confirmStatusDialogOpen}
                onOpenChange={setConfirmStatusDialogOpen}
            >
                <DialogContent>
                    {/*<DialogContent className="mx-4 sm:mx-6">*/}
                    <DialogHeader>
                        <DialogTitle>
                            Подтверждение изменения статуса
                        </DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите отметить{' '}
                            {selectedWords.length} слов(а) как{' '}
                            {pendingStatusAction === 'LEARNED'
                                ? 'выученные'
                                : 'невыученные'}
                            ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-row gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={handleCloseStatusDialog}
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
