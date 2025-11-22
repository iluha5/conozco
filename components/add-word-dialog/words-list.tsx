/**
 * Список слов в диалоге добавления
 */

'use client';

import { Loader2 } from 'lucide-react';
import { WordCard } from './word-card';
import { WordsListSkeleton } from './words-list-skeleton';
import { WordsListEmpty } from './words-list-empty';
import { BulkActions } from './bulk-actions';
import type { BaseWord } from '@/types/add-word-dialog.types';
import type { PartOfSpeech } from '@/hooks/shared';

type WordsListProps = {
    words: BaseWord[];
    searching: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    isWordSelected: (id: string) => boolean;
    onToggleWord: (id: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onLoadMore: () => void;
    onOpenTranslationDialog: (word: BaseWord) => void;
    translationDialogOpen: { [key: string]: boolean };
    onTranslationDialogClose: (wordId: string, open: boolean) => void;
    selectedWordForTranslation: any;
    partsOfSpeech: PartOfSpeech[];
    onTranslationSave: () => Promise<void>;
    isClient: boolean;
};

export function WordsList({
    words,
    searching,
    loadingMore,
    hasMore,
    isWordSelected,
    onToggleWord,
    onSelectAll,
    onDeselectAll,
    onLoadMore,
    onOpenTranslationDialog,
    translationDialogOpen,
    onTranslationDialogClose,
    selectedWordForTranslation,
    partsOfSpeech,
    onTranslationSave,
    isClient,
}: WordsListProps) {
    return (
        <div className="space-y-2">
            {/* Заголовок и массовые действия */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                    Доступные слова{' '}
                    {searching && (
                        <Loader2 className="w-4 h-4 animate-spin inline ml-2" />
                    )}
                </label>
                <BulkActions
                    onSelectAll={onSelectAll}
                    onDeselectAll={onDeselectAll}
                    disabled={searching || words.length === 0}
                />
            </div>

            <div className="space-y-3">
                {/* Список слов */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[300px] overflow-y-auto border rounded-md p-3 bg-gray-50">
                    {searching && words.length === 0 ? (
                        <WordsListSkeleton />
                    ) : words.length > 0 ? (
                        words.map(word => (
                            <WordCard
                                key={word.id}
                                word={word}
                                isSelected={isWordSelected(word.id)}
                                onToggle={() => onToggleWord(word.id)}
                                onOpenTranslationDialog={() =>
                                    onOpenTranslationDialog(word)
                                }
                                translationDialogOpen={
                                    translationDialogOpen[word.id] || false
                                }
                                onTranslationDialogClose={open =>
                                    onTranslationDialogClose(word.id, open)
                                }
                                selectedWordForTranslation={
                                    selectedWordForTranslation
                                }
                                partsOfSpeech={partsOfSpeech}
                                onTranslationSave={onTranslationSave}
                                isClient={isClient}
                            />
                        ))
                    ) : (
                        <WordsListEmpty />
                    )}
                </div>

                {/* Кнопка "Показать еще" */}
                <div className="flex justify-center pt-1 pb-1">
                    <button
                        onClick={onLoadMore}
                        disabled={searching || loadingMore || !hasMore}
                        className={`text-sm text-black underline decoration-dotted decoration-1 underline-offset-2 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${!hasMore && words.length > 0 ? 'invisible' : ''}`}
                    >
                        Показать еще
                    </button>
                </div>
            </div>
        </div>
    );
}
