/**
 * Фильтры для диалога добавления слов
 */

'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectTrigger } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, X } from 'lucide-react';
import { WordGroupsFilter } from '@/components/word-groups/WordGroupsFilter';
import { BulkActions } from './BulkActions';
import { Badge } from '@/components/ui/badge';

type AddWordDialogFiltersProps = {
    selectedPartsOfSpeech: string[];
    onTogglePartOfSpeech: (_pos: string) => void;
    searchTerm: string;
    onSearchChange: (_value: string) => void;
    hasExactMatch: boolean;
    aiSearching: boolean;
    onAiSearch: () => void;
    autoFocus?: boolean;
    selectedGroupIds: number[];
    onToggleGroup: (_groupId: number) => void;
    onToggleAllGroups: (_groupIds: number[]) => void;
    words: Array<{ id: string }>;
    selectedWords: string[];
    onToggleAllSelection: () => void;
    searching: boolean;
    filteredWordsCount: number;
};

const PARTS_OF_SPEECH = [
    { value: 'VERB', label: 'Verb' },
    { value: 'NOUN', label: 'Noun' },
    { value: 'ADJECTIVE', label: 'Adjective' },
    { value: 'ADVERB', label: 'Adverb' },
    { value: 'PRONOUN', label: 'Pronoun' },
    { value: 'PREPOSITION', label: 'Preposition' },
    { value: 'CONJUNCTION', label: 'Conjunction' },
    { value: 'INTERJECTION', label: 'Interjection' },
    { value: 'ARTICLE', label: 'Article' },
    { value: 'DETERMINER', label: 'Determiner' },
    { value: 'NUMERAL', label: 'Numeral' },
    { value: 'PHRASE', label: 'Phrase' },
];

export function AddWordDialogFilters({
    selectedPartsOfSpeech,
    onTogglePartOfSpeech,
    searchTerm,
    onSearchChange,
    hasExactMatch,
    aiSearching,
    onAiSearch,
    autoFocus = false,
    selectedGroupIds,
    onToggleGroup,
    onToggleAllGroups,
    words,
    selectedWords,
    onToggleAllSelection,
    searching,
    filteredWordsCount,
}: AddWordDialogFiltersProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-3">
            {/* Поле поиска и кнопка AI */}
            <div className="relative flex-1 min-w-[200px] flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        ref={searchInputRef}
                        placeholder="Поиск..."
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                        className="pl-10 pr-10"
                        autoFocus={autoFocus}
                        onKeyDown={e => {
                            if (
                                e.key === 'Enter' &&
                                !hasExactMatch &&
                                searchTerm.trim() &&
                                !aiSearching
                            ) {
                                onAiSearch();
                            }
                        }}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => {
                                onSearchChange('');
                                searchInputRef.current?.focus();
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            type="button"
                            aria-label="Очистить поиск"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="default"
                    onClick={onAiSearch}
                    disabled={
                        hasExactMatch || !searchTerm.trim() || aiSearching
                    }
                    title={
                        hasExactMatch
                            ? 'Слово найдено в базе'
                            : 'Добавить слово через AI (LibreTranslate + Tatoeba)'
                    }
                    className="min-w-[120px]"
                >
                    {aiSearching && (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Добавить
                </Button>
            </div>

            {/* Фильтры: Группы, Части речи, Добавить все */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <WordGroupsFilter
                        selectedGroupIds={selectedGroupIds}
                        onToggleGroup={onToggleGroup}
                        onToggleAll={onToggleAllGroups}
                    />
                    <div className="relative w-[140px]">
                        <Select value="parts-of-speech">
                            <SelectTrigger className="h-9">
                                <span className="text-sm truncate">
                                    {selectedPartsOfSpeech.length === 0
                                        ? 'Части речи'
                                        : `${selectedPartsOfSpeech.length} шт.`}
                                </span>
                            </SelectTrigger>
                            <SelectContent>
                                <div className="p-2 space-y-2">
                                    {PARTS_OF_SPEECH.map(pos => (
                                        <div
                                            key={pos.value}
                                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                                            onClick={e => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onTogglePartOfSpeech(pos.value);
                                            }}
                                        >
                                            <Checkbox
                                                checked={selectedPartsOfSpeech.includes(
                                                    pos.value,
                                                )}
                                                onCheckedChange={() =>
                                                    onTogglePartOfSpeech(
                                                        pos.value,
                                                    )
                                                }
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }
                                            />
                                            <label className="text-sm cursor-pointer">
                                                {pos.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </SelectContent>
                        </Select>
                    </div>
                    <BulkActions
                        words={words}
                        selectedWords={selectedWords}
                        onToggleAllSelection={onToggleAllSelection}
                        disabled={searching || words.length === 0}
                    />
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-sm text-gray-600">Показано:</span>
                        <Badge
                            variant="outline"
                            className="gap-1.5 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm text-sm"
                        >
                            <span className="text-gray-900 dark:text-gray-100">
                                {filteredWordsCount}
                            </span>
                            {(() => {
                                const selectedInFiltered = words.filter(word =>
                                    selectedWords.includes(word.id),
                                ).length;
                                return selectedInFiltered > 0 ? (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-600">
                                            |
                                        </span>
                                        <span className="text-orange-600 dark:text-orange-500">
                                            {selectedInFiltered}
                                        </span>
                                    </>
                                ) : null;
                            })()}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
}
