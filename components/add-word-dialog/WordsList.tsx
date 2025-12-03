/**
 * Список слов в диалоге добавления
 */

'use client';

import { WordCard } from './WordCard';
import { WordsListSkeleton } from './WordsListSkeleton';
import { WordsListEmpty } from './WordsListEmpty';
import { WordsListSearchPrompt } from './WordsListSearchPrompt';
import type { BaseWord } from '@/types/add-word-dialog.types';
import type { PartOfSpeech } from '@/hooks/shared';

type WordsListProps = {
    words: BaseWord[];
    searching: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    isWordSelected: (_id: string) => boolean;
    onToggleWord: (_id: string) => void;
    selectedWords: string[];
    onToggleAllSelection: () => void;
    onLoadMore: () => void;
    onOpenTranslationDialog: (_word: BaseWord) => void;
    translationDialogOpen: { [key: string]: boolean };
    onTranslationDialogClose: (_wordId: string, _open: boolean) => void;
    selectedWordForTranslation: any;
    partsOfSpeech: PartOfSpeech[];
    onTranslationSave: () => Promise<void>;
    isClient: boolean;
    searchTerm: string;
};

export function WordsList({
    words,
    searching,
    loadingMore,
    hasMore,
    isWordSelected,
    onToggleWord,
    selectedWords: _selectedWords,
    onToggleAllSelection: _onToggleAllSelection,
    onLoadMore,
    onOpenTranslationDialog,
    translationDialogOpen,
    onTranslationDialogClose,
    selectedWordForTranslation,
    partsOfSpeech,
    onTranslationSave,
    isClient,
    searchTerm,
}: WordsListProps) {
    const isSearchEmpty = searchTerm.trim().length === 0;

    const renderListContent = () => {
        if (isSearchEmpty) {
            return <WordsListSearchPrompt />;
        }

        if (searching && words.length === 0) {
            return <WordsListSkeleton />;
        }

        if (words.length > 0) {
            return words.map(word => (
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
                    selectedWordForTranslation={selectedWordForTranslation}
                    partsOfSpeech={partsOfSpeech}
                    onTranslationSave={onTranslationSave}
                    isClient={isClient}
                />
            ));
        }

        return <WordsListEmpty />;
    };

    return (
        <div className="space-y-2">
            <div className="space-y-3">
                {/* Список слов */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[300px] overflow-y-auto border rounded-md p-3 bg-gray-50">
                    {renderListContent()}
                </div>

                {/* Кнопка "Показать еще" */}
                <div className="flex justify-center pt-1 pb-1">
                    <button
                        onClick={onLoadMore}
                        disabled={
                            searching ||
                            loadingMore ||
                            !hasMore ||
                            isSearchEmpty
                        }
                        className={`text-sm text-black underline decoration-dotted decoration-1 underline-offset-2 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${(!hasMore && words.length > 0) || isSearchEmpty ? 'invisible' : ''}`}
                    >
                        Показать еще
                    </button>
                </div>
            </div>
        </div>
    );
}
