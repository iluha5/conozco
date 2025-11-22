/**
 * Фильтры для диалога добавления слов
 */

'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, X } from 'lucide-react';

type AddWordDialogFiltersProps = {
    languageCode: 'en' | 'es';
    onLanguageChange: (value: 'en' | 'es') => void;
    selectedPartsOfSpeech: string[];
    onTogglePartOfSpeech: (pos: string) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    hasExactMatch: boolean;
    aiSearching: boolean;
    onAiSearch: () => void;
    autoFocus?: boolean;
};

const PARTS_OF_SPEECH = [
    { value: 'VERB', label: 'Глагол' },
    { value: 'NOUN', label: 'Существительное' },
    { value: 'ADJECTIVE', label: 'Прилагательное' },
    { value: 'ADVERB', label: 'Наречие' },
    { value: 'PRONOUN', label: 'Местоимение' },
];

export function AddWordDialogFilters({
    languageCode,
    onLanguageChange,
    selectedPartsOfSpeech,
    onTogglePartOfSpeech,
    searchTerm,
    onSearchChange,
    hasExactMatch,
    aiSearching,
    onAiSearch,
    autoFocus = false,
}: AddWordDialogFiltersProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-wrap gap-2">
            {/* Селектор языка */}
            <Select value={languageCode} onValueChange={onLanguageChange}>
                <SelectTrigger className="w-[100px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="es">🇪🇸 Исп</SelectItem>
                    <SelectItem value="en">🇬🇧 Англ</SelectItem>
                </SelectContent>
            </Select>

            {/* Селектор частей речи */}
            <div className="relative w-[140px]">
                <Select value="parts-of-speech">
                    <SelectTrigger>
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
                                            onTogglePartOfSpeech(pos.value)
                                        }
                                        onClick={e => e.stopPropagation()}
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
        </div>
    );
}
