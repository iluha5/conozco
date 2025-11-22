import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Word } from '@/types/words.types';

interface WordsSelectorProps {
    filteredWords: Word[];
    selectedWords: Set<string>;
    selectedLanguage: string;
    isLoading: boolean;
    onLanguageChange: (_language: string) => void;
    onToggleWord: (_wordId: number) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    isWordSelected: (_wordId: number) => boolean;
}

export const WordsSelector = ({
    filteredWords,
    selectedWords,
    selectedLanguage,
    isLoading,
    onLanguageChange,
    onToggleWord,
    onSelectAll,
    onDeselectAll,
    isWordSelected,
}: WordsSelectorProps) => {
    const [visibleWordsCount, setVisibleWordsCount] = useState(12);

    // Сброс видимых слов при изменении языка
    useEffect(() => {
        setVisibleWordsCount(12);
    }, [selectedLanguage]);

    const loadMoreWords = () => {
        setVisibleWordsCount(prev => Math.min(prev + 12, filteredWords.length));
    };

    const visibleWords = filteredWords.slice(0, visibleWordsCount);

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">
                Выберите слова для тренировки ({selectedWords.size} выбрано)
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
                <Select
                    value={selectedLanguage}
                    onValueChange={onLanguageChange}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Выберите язык" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Все языки</SelectItem>
                        <SelectItem value="en">🇬🇧 Англ</SelectItem>
                        <SelectItem value="es">🇪🇸 Исп</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    onClick={onSelectAll}
                    disabled={isLoading}
                >
                    Выбрать все
                </Button>
                <Button
                    variant="outline"
                    onClick={onDeselectAll}
                    disabled={isLoading}
                >
                    Снять
                </Button>
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
                            Нет слов для выбранного языка.
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
                        disabled={filteredWords.length <= visibleWordsCount}
                        className="text-sm"
                    >
                        {filteredWords.length > visibleWordsCount
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
