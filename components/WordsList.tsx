'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, CheckCircle, CheckCircle2, X } from 'lucide-react';
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
        partOfSpeech: {
            id: string | number;
            name: string;
            displayName: string;
        };
        languageId: string | number;
        translations: Array<{
            translation: string;
            priority: number;
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

type WordsListProps = {
    words: Word[];
    onWordsChange?: () => Promise<void>;
    showBulkActions?: boolean;
    readOnly?: boolean;
    emptyMessage?: string;
};

export function WordsList({
    words,
    onWordsChange,
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

        try {
            const response = await fetch(`/api/words/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await onWordsChange?.();
            }
        } catch (error) {
            console.error('Error deleting word:', error);
        }
    };

    const handleToggleStatus = async (word: Word) => {
        if (readOnly) return;

        try {
            const newStatus =
                word.status === 'LEARNED' ? 'NOT_LEARNED' : 'LEARNED';
            const response = await fetch(`/api/words/${word.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                await onWordsChange?.();
            }
        } catch (error) {
            console.error('Error updating word:', error);
        }
    };

    const toggleWordSelection = (wordId: string | number) => {
        setSelectedWords(prev =>
            prev.includes(wordId)
                ? prev.filter(id => id !== wordId)
                : [...prev, wordId],
        );
    };

    const selectAllWords = () => {
        setSelectedWords(words.map(word => word.id));
    };

    const deselectAllWords = () => {
        setSelectedWords([]);
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

    const handleBulkStatusChange = async (
        newStatus: 'LEARNED' | 'NOT_LEARNED',
    ) => {
        if (readOnly) return;

        if (selectedWords.length === 0) {
            toast({
                title: 'Ошибка',
                description: 'Выберите слова для изменения статуса',
                variant: 'destructive',
            });
            return;
        }

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
                await onWordsChange?.();
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
        }
    };

    const handleBulkDelete = async () => {
        if (readOnly) return;

        if (selectedWords.length === 0) {
            toast({
                title: 'Ошибка',
                description: 'Выберите слова для удаления',
                variant: 'destructive',
            });
            return;
        }

        let successCount = 0;
        let errorCount = 0;

        try {
            for (const wordId of selectedWords) {
                const response = await fetch(`/api/words/${wordId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    successCount++;
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
                await onWordsChange?.();
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
                            onClick={selectAllWords}
                            disabled={
                                selectedWords.length === words.length ||
                                readOnly
                            }
                        >
                            Выбрать все
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={deselectAllWords}
                            disabled={selectedWords.length === 0 || readOnly}
                        >
                            Снять
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
                            onClick={() => handleBulkStatusChange('LEARNED')}
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
                {words.map(word => (
                    <Card
                        key={word.id}
                        className={`transition-all ${readOnly ? '' : 'cursor-pointer'} m-1 ${
                            isWordSelected(word.id)
                                ? 'ring-2 ring-primary bg-blue-50'
                                : 'hover:bg-gray-50'
                        }`}
                        onClick={() =>
                            !readOnly && toggleWordSelection(word.id)
                        }
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {!readOnly && (
                                        <Checkbox
                                            checked={isWordSelected(word.id)}
                                            onChange={() => {}}
                                            className="shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                            <span className="truncate">
                                                {word.baseWord?.word ||
                                                    word.customWord}
                                            </span>
                                            <span className="text-sm shrink-0">
                                                {getLanguageFlag(
                                                    word.language.code,
                                                )}
                                            </span>
                                            {(() => {
                                                // Приоритет: часть речи из кастомного перевода, затем из baseWord
                                                const customPartOfSpeech =
                                                    word.customTranslations?.[0]
                                                        ?.partOfSpeech;
                                                const basePartOfSpeech =
                                                    word.baseWord?.partOfSpeech;

                                                const partOfSpeech =
                                                    customPartOfSpeech ||
                                                    basePartOfSpeech;

                                                // Не показываем плашку, если часть речи неизвестна
                                                if (!partOfSpeech) {
                                                    return null;
                                                }

                                                return (
                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">
                                                        {getPartOfSpeechAbbrev(
                                                            partOfSpeech.displayName,
                                                        )}
                                                    </span>
                                                );
                                            })()}
                                        </CardTitle>
                                        <div className="flex items-center gap-1">
                                            <span
                                                className={`truncate ${readOnly ? '' : 'cursor-pointer hover:text-blue-600'} transition-colors ${
                                                    hasTranslations(
                                                        word.customTranslations,
                                                        word.baseWord
                                                            ?.translations,
                                                    )
                                                        ? 'text-blue-500'
                                                        : 'text-gray-500'
                                                }`}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    if (
                                                        !readOnly &&
                                                        word.baseWord
                                                    ) {
                                                        openTranslationDialog(
                                                            word,
                                                        );
                                                    }
                                                }}
                                            >
                                                {getCurrentTranslation(
                                                    word.customTranslations,
                                                    word.baseWord?.translations,
                                                )}
                                            </span>
                                            {hasTranslations(
                                                word.customTranslations,
                                                word.baseWord?.translations,
                                            ) && (
                                                <span className="text-xs text-gray-400 shrink-0">
                                                    {getTranslationsCountText(
                                                        word.baseWord
                                                            ?.translations
                                                            ?.length || 0,
                                                        !!(
                                                            word.customTranslations &&
                                                            word
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
                                                word.id && (
                                                <TranslationSelectorDialog
                                                    word={word}
                                                    open={
                                                        translationDialogOpen[
                                                            word.id
                                                        ] || false
                                                    }
                                                    onOpenChange={open =>
                                                        handleDialogClose(
                                                            word.id,
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
                                            {word.status === 'LEARNED' ? (
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
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
}
