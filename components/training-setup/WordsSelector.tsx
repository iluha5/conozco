import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { WordGroupsFilter } from '@/components/word-groups/WordGroupsFilter';
import { Square, CheckSquare, MinusSquare } from 'lucide-react';
import { Word } from '@/types/words.types';
import { SelectionState } from '@/hooks/training-setup/use-words-selection';

interface WordsSelectorProps {
    filteredWords: Word[];
    selectedWords: Set<string>;
    isLoading: boolean;
    onToggleWord: (_wordId: number) => void;
    onToggleAllWordsSelection: () => void;
    isWordSelected: (_wordId: number) => boolean;
    selectedGroupIds: number[];
    onToggleGroup: (_groupId: number) => void;
    onToggleAllGroups: (_groupIds: number[]) => void;
    selectionState: SelectionState;
    getBulkSelectText: () => string;
    visibleWords: Word[];
    visibleWordsCount: number;
    loadMoreWords: () => void;
    hasMoreWords: boolean;
}

export const WordsSelector = ({
    filteredWords,
    selectedWords,
    isLoading,
    onToggleWord,
    onToggleAllWordsSelection,
    isWordSelected,
    selectedGroupIds,
    onToggleGroup,
    onToggleAllGroups,
    selectionState,
    getBulkSelectText,
    visibleWords,
    visibleWordsCount,
    loadMoreWords,
    hasMoreWords,
}: WordsSelectorProps) => {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">
                Выберите слова для тренировки ({selectedWords.size} выбрано)
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onToggleAllWordsSelection}
                    disabled={isLoading}
                >
                    {(() => {
                        if (selectionState === 'none') {
                            return <Square className="mr-2 h-4 w-4" />;
                        } else if (selectionState === 'all') {
                            return <CheckSquare className="mr-2 h-4 w-4" />;
                        } else {
                            return <MinusSquare className="mr-2 h-4 w-4" />;
                        }
                    })()}
                    {getBulkSelectText()}
                </Button>
                <WordGroupsFilter
                    selectedGroupIds={selectedGroupIds}
                    onToggleGroup={onToggleGroup}
                    onToggleAll={onToggleAllGroups}
                />
            </div>
            <div className="relative border rounded-lg p-4 h-[350px] overflow-y-auto">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-600">
                                Загрузка слов...
                            </p>
                        </div>
                    </div>
                ) : filteredWords.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 text-center">
                            Нет слов для тренировки.
                            <br />
                            <span className="text-sm">
                                Добавьте слова на странице{' '}
                                <Link
                                    href="/words"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                >
                                    Мои слова
                                </Link>
                            </span>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {visibleWords.map(word => (
                            <div
                                key={word.id}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                onClick={() => onToggleWord(word.id)}
                            >
                                <Checkbox
                                    id={`word-${word.id}`}
                                    checked={isWordSelected(word.id)}
                                    onChange={() => {}}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium truncate">
                                            {word.baseWord?.word ||
                                                word.customWord}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            →
                                        </span>
                                        <span className="text-sm text-purple-600 truncate">
                                            {word.baseWord?.translations &&
                                            word.baseWord.translations.length >
                                                0
                                                ? word.baseWord.translations[0]
                                                      .translation
                                                : 'Нет перевода'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {!isLoading && filteredWords.length > 0 && (
                <div className="flex justify-center mt-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadMoreWords}
                        disabled={!hasMoreWords}
                        className="text-sm"
                    >
                        {hasMoreWords
                            ? `Показать еще (${Math.min(visibleWordsCount + 12, filteredWords.length) - visibleWordsCount} слов)`
                            : 'Все слова показаны'}
                    </Button>
                </div>
            )}
            {!isLoading && (
                <p className="text-xs text-gray-500 mt-2">
                    Показано {Math.min(visibleWordsCount, filteredWords.length)}{' '}
                    из {filteredWords.length} слов
                </p>
            )}
        </div>
    );
};
