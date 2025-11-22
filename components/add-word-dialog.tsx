'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'react-use';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Loader2, Search, X } from 'lucide-react';
import { useToast, useTrainingSelection } from '@/hooks/shared';
import { TranslationSelectorDialog } from '@/components/translation-selector-dialog';
import { getLanguageFlag, getPartOfSpeechAbbrev } from '@/lib/word-utils';

type PartOfSpeech = {
    id: string;
    name: string;
    displayName: string;
};

type BaseWord = {
    id: string;
    word: string;
    partOfSpeech: PartOfSpeech;
    language: {
        code: string;
        name: string;
    };
    translations: Array<{
        translation: string;
        priority: number;
    }>;
    examples: Array<{
        example: string;
        translation: string;
        pronoun: {
            pronoun: string;
        };
        sentenceType?: {
            id: number;
            code: string;
            displayName: string;
            isNegative: boolean;
            isQuestion: boolean;
        };
    }>;
    isAddedByUser: boolean;
    customTranslations?: Array<{
        id: number;
        translation: string;
        partOfSpeech?: {
            id: number;
            name: string;
            displayName: string;
        };
        partOfSpeechId?: number | null;
        originalLanguage: {
            id: number;
            code: string;
            name: string;
        };
        translationLanguage: {
            id: number;
            code: string;
            name: string;
        };
    }>;
};

type SelectedWord = string; // просто baseWordId

type PartOfSpeechType = {
    id: number;
    name: string;
    displayName: string;
};

type AddWordDialogProps = {
    onWordAdded: () => void;
};

export function AddWordDialog({ onWordAdded }: AddWordDialogProps) {
    const [open, setOpen] = useState(false);
    const { selectedLanguage, setSelectedLanguage } = useTrainingSelection();
    // Преобразуем selectedLanguage для использования в диалоге
    // Если 'ALL', используем 'es' по умолчанию
    const languageCode: 'en' | 'es' =
        selectedLanguage === 'en' || selectedLanguage === 'es'
            ? selectedLanguage
            : 'es';
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedPartsOfSpeech, setSelectedPartsOfSpeech] = useState<
        string[]
    >([]);
    const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([]);
    const [availableWords, setAvailableWords] = useState<BaseWord[]>([]);
    const [searching, setSearching] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [needsScroll, setNeedsScroll] = useState(false);
    const [hasExactMatch, setHasExactMatch] = useState(false);
    const [aiSearching, setAiSearching] = useState(false);
    const [skipAutoSearch, setSkipAutoSearch] = useState(false);
    const [translationDialogOpen, setTranslationDialogOpen] = useState<{
        [key: string]: boolean;
    }>({});
    const [selectedWordForTranslation, setSelectedWordForTranslation] =
        useState<any | null>(null);
    const [partsOfSpeech, setPartsOfSpeech] = useState<PartOfSpeechType[]>([]);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Debounce поиска на 200мс для снижения количества запросов к серверу
    useDebounce(
        () => {
            setDebouncedSearchTerm(searchTerm);
        },
        400,
        [searchTerm],
    );

    // Инициализация isClient
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Загружаем части речи для русского языка
    useEffect(() => {
        const fetchPartsOfSpeech = async () => {
            try {
                const response = await fetch(
                    '/api/parts-of-speech?languageCode=ru',
                );
                if (response.ok) {
                    const data = await response.json();
                    setPartsOfSpeech(data);
                }
            } catch (error) {
                console.error('Error fetching parts of speech:', error);
            }
        };
        fetchPartsOfSpeech();
    }, []);

    // Проверка, нужен ли скролл для попапа
    useEffect(() => {
        const checkViewportSize = () => {
            // Примерная высота попапа: header(60) + filters(80) + list(300) + controls(40) + footer(60) + padding(60) = ~600px
            const estimatedDialogHeight = 600;
            const viewportHeight = window.innerHeight;
            // Если попап занимает больше 90% высоты viewport, включаем скролл
            setNeedsScroll(viewportHeight * 0.9 < estimatedDialogHeight);
        };

        checkViewportSize();
        window.addEventListener('resize', checkViewportSize);
        return () => window.removeEventListener('resize', checkViewportSize);
    }, []);

    // Автоматический фокус на поле поиска при открытии попапа
    useEffect(() => {
        if (open) {
            // Небольшая задержка для корректной работы с анимацией диалога
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [open]);

    // Проверка наличия точных совпадений
    useEffect(() => {
        if (!searchTerm.trim()) {
            setHasExactMatch(false);
            return;
        }

        const trimmedSearch = searchTerm.trim().toLowerCase();
        const exactMatch = availableWords.find(
            word => word.word.toLowerCase() === trimmedSearch,
        );
        setHasExactMatch(!!exactMatch);
    }, [searchTerm, availableWords]);

    // Инициализация selectedWords на основе isAddedByUser
    useEffect(() => {
        // Автоматически выбираем все слова, которые уже добавлены пользователем
        const addedWords = availableWords
            .filter(word => word.isAddedByUser)
            .map(word => word.id);
        setSelectedWords(prev => {
            // Объединяем существующие выборы с новыми добавленными словами
            const combinedSet = new Set([...prev, ...addedWords]);
            return Array.from(combinedSet);
        });
    }, [availableWords]);

    // Поиск слов при изменении параметров
    // Используем debouncedSearchTerm вместо searchTerm для снижения нагрузки
    useEffect(() => {
        if (open && !skipAutoSearch) {
            // Сброс и загрузка при изменении языка или поиска
            setOffset(0);
            setAvailableWords([]);
            setHasMore(true);
            handleSearch(0, true);
        }

        // Сбрасываем флаг после пропуска
        if (skipAutoSearch) {
            setSkipAutoSearch(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [languageCode, debouncedSearchTerm, open, skipAutoSearch]);

    // Функция для фильтрации слов по частям речи (клиентская фильтрация)
    // ВАЖНО: Мы показываем ВСЕ слова, включая уже добавленные пользователем
    // Уже добавленные слова визуально отличаются и не могут быть выбраны повторно
    const getFilteredWords = () => {
        if (selectedPartsOfSpeech.length === 0) {
            return availableWords; // Показываем все слова
        }
        return availableWords.filter(
            word =>
                word.partOfSpeech &&
                selectedPartsOfSpeech.includes(word.partOfSpeech.name),
        );
    };

    const togglePartOfSpeech = (pos: string) => {
        setSelectedPartsOfSpeech(prev =>
            prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos],
        );
    };

    // Функция для добавления слова
    const addWord = async (baseWordId: string) => {
        try {
            const response = await fetch('/api/words', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    baseWordId: baseWordId,
                }),
            });

            if (response.ok) {
                // Обновляем состояние слова в availableWords
                setAvailableWords(prev =>
                    prev.map(w =>
                        w.id === baseWordId ? { ...w, isAddedByUser: true } : w,
                    ),
                );
                setSelectedWords(prev => [...prev, baseWordId]);
                onWordAdded();
                return true;
            } else {
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось добавить слово',
                    variant: 'destructive',
                });
                return false;
            }
        } catch (error) {
            console.error('Error adding word:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось добавить слово',
                variant: 'destructive',
            });
            return false;
        }
    };

    // Функция для удаления слова
    const removeWord = async (baseWordId: string) => {
        try {
            // Получаем список пользовательских слов
            const userWordsResponse = await fetch('/api/words');
            if (userWordsResponse.ok) {
                const userWords = await userWordsResponse.json();
                const userWord = userWords.find(
                    (w: any) => w.baseWordId === baseWordId,
                );

                if (userWord) {
                    const response = await fetch(`/api/words/${userWord.id}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        // Обновляем состояние слова в availableWords
                        setAvailableWords(prev =>
                            prev.map(w =>
                                w.id === baseWordId
                                    ? { ...w, isAddedByUser: false }
                                    : w,
                            ),
                        );
                        setSelectedWords(prev =>
                            prev.filter(id => id !== baseWordId),
                        );
                        onWordAdded();
                        return true;
                    }
                }
            }

            toast({
                title: 'Ошибка',
                description: 'Не удалось удалить слово',
                variant: 'destructive',
            });
            return false;
        } catch (error) {
            console.error('Error removing word:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось удалить слово',
                variant: 'destructive',
            });
            return false;
        }
    };

    // Функции для работы с выбранными словами
    // Теперь выбранные слова - это те, которые должны быть в списке пользователя
    // Слова с isAddedByUser=true по умолчанию считаются выбранными
    const toggleWordSelection = async (baseWordId: string) => {
        const word = availableWords.find(w => w.id === baseWordId);
        if (!word) return;

        if (word.isAddedByUser) {
            await removeWord(baseWordId);
        } else {
            await addWord(baseWordId);
        }
    };

    const selectAllWords = async () => {
        const filteredWords = getFilteredWords();
        let addedCount = 0;

        for (const word of filteredWords) {
            if (!word.isAddedByUser) {
                const success = await addWord(word.id);
                if (success) addedCount++;
            }
        }

        if (addedCount > 0) {
            toast({
                title: 'Успешно',
                description: `Добавлено слов: ${addedCount}`,
            });
        }
    };

    const deselectAllWords = async () => {
        const filteredWords = getFilteredWords();
        let removedCount = 0;

        for (const word of filteredWords) {
            if (word.isAddedByUser) {
                const success = await removeWord(word.id);
                if (success) removedCount++;
            }
        }

        if (removedCount > 0) {
            toast({
                title: 'Успешно',
                description: `Удалено слов: ${removedCount}`,
            });
        }
    };

    // Слово выбрано, если оно в selectedWords
    const isWordSelected = (baseWordId: string) => {
        return selectedWords.includes(baseWordId);
    };

    const handleSearch = async (
        currentOffset: number = offset,
        isNewSearch: boolean = false,
    ) => {
        if (isNewSearch) {
            setSearching(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams({
                languageCode,
                limit: '30',
                offset: currentOffset.toString(),
            });

            // Используем debouncedSearchTerm для запроса к серверу
            if (debouncedSearchTerm.trim()) {
                params.set('search', debouncedSearchTerm.trim());
            }

            const response = await fetch(`/api/base-words?${params}`);

            if (response.ok) {
                const words = await response.json();

                // Если это новый поиск, заменяем слова, иначе добавляем
                if (isNewSearch) {
                    setAvailableWords(words);
                } else {
                    setAvailableWords(prev => [...prev, ...words]);
                }

                // Если получили меньше 30 слов, значит больше нет
                setHasMore(words.length === 30);
                setOffset(currentOffset + words.length);
            } else {
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось загрузить слова',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error searching words:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить слова',
                variant: 'destructive',
            });
        } finally {
            setSearching(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        handleSearch(offset, false);
    };

    const handleAiSearch = async () => {
        if (!searchTerm.trim()) {
            toast({
                title: 'Ошибка',
                description: 'Введите слово для поиска',
                variant: 'destructive',
            });
            return;
        }

        setAiSearching(true);

        try {
            const response = await fetch('/api/ai-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    word: searchTerm.trim(),
                    languageCode,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const addedWord = searchTerm.trim();
                const message = data.alreadyExists
                    ? `Слово "${addedWord}" уже есть в базе${data.foundExamples > 0 ? ` (${data.foundExamples} примеров)` : ''}`
                    : `Слово "${addedWord}" добавлено в базу${data.foundExamples > 0 ? ` с ${data.foundExamples} примерами` : ''}`;

                toast({
                    title: 'Успешно',
                    description: message,
                });

                // Даем время БД закоммитить транзакцию и обновляем список
                setTimeout(async () => {
                    setOffset(0);
                    setHasMore(true);

                    const params = new URLSearchParams({
                        languageCode,
                        limit: '30',
                        offset: '0',
                    });

                    // Используем текущий searchTerm для показа добавленного слова
                    if (searchTerm.trim()) {
                        params.set('search', searchTerm.trim());
                    }

                    const response = await fetch(`/api/base-words?${params}`);
                    if (response.ok) {
                        const words = await response.json();
                        setAvailableWords(words);
                        setHasMore(words.length === 30);
                        setOffset(words.length);

                        // Сразу добавляем найденное слово в список пользователя
                        const addedBaseWord = words.find(
                            (w: BaseWord) =>
                                w.word.toLowerCase() ===
                                addedWord.toLowerCase(),
                        );
                        if (addedBaseWord && !addedBaseWord.isAddedByUser) {
                            await addWord(addedBaseWord.id);
                        }
                    }
                }, 300);
            } else {
                toast({
                    title: 'Ошибка',
                    description:
                        data.error || 'Не удалось найти или добавить слово',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error in AI search:', error);
            toast({
                title: 'Ошибка',
                description: 'Произошла ошибка при поиске слова',
                variant: 'destructive',
            });
        } finally {
            setAiSearching(false);
        }
    };

    // Функции для работы с диалогом выбора перевода
    const getCurrentTranslation = (word: BaseWord): string => {
        // Приоритет: кастомный перевод -> базовый перевод
        if (word.customTranslations && word.customTranslations.length > 0) {
            return word.customTranslations[0].translation;
        }
        if (word.translations && word.translations.length > 0) {
            return word.translations[0].translation;
        }
        return 'Нет перевода';
    };

    // Преобразование BaseWord в формат Word для TranslationSelectorDialog
    const convertBaseWordToWord = async (
        baseWord: BaseWord,
    ): Promise<any | null> => {
        try {
            // Получаем список пользовательских слов
            const userWordsResponse = await fetch('/api/words');
            if (userWordsResponse.ok) {
                const userWords = await userWordsResponse.json();
                const userWord = userWords.find(
                    (w: any) => w.baseWordId === baseWord.id,
                );

                if (userWord) {
                    // Преобразуем BaseWord в формат Word
                    return {
                        id: userWord.id,
                        userId: userWord.userId,
                        baseWordId: baseWord.id,
                        languageId: baseWord.language.code,
                        language: baseWord.language,
                        status: userWord.status,
                        createdAt: userWord.createdAt,
                        updatedAt: userWord.updatedAt,
                        baseWord: {
                            id: baseWord.id,
                            word: baseWord.word,
                            partOfSpeech: baseWord.partOfSpeech,
                            languageId: baseWord.language.code,
                            translations: baseWord.translations,
                            examples: baseWord.examples,
                        },
                        customTranslations: userWord.customTranslations || [],
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Error converting BaseWord to Word:', error);
            return null;
        }
    };

    const openTranslationDialog = async (word: BaseWord) => {
        if (!word.isAddedByUser) return;

        const convertedWord = await convertBaseWordToWord(word);
        if (convertedWord) {
            setSelectedWordForTranslation(convertedWord as any);
            setTranslationDialogOpen({
                ...translationDialogOpen,
                [word.id]: true,
            });
        } else {
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить данные слова',
                variant: 'destructive',
            });
        }
    };

    const handleDialogClose = (wordId: string, open: boolean) => {
        setTranslationDialogOpen(prev => ({
            ...prev,
            [wordId]: open,
        }));
        if (!open) {
            setSelectedWordForTranslation(null);
        }
    };

    const handleTranslationSave = async () => {
        // Обновляем список слов после сохранения перевода
        await handleSearch(0, true);
    };

    const resetForm = () => {
        setSelectedWords([]);
        setAvailableWords([]);
        setOffset(0);
        setHasMore(true);
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setSelectedPartsOfSpeech([]);
        setSkipAutoSearch(false);
        setHasExactMatch(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            // При закрытии диалога сбрасываем форму
            resetForm();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="lg">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Добавить слово
                </Button>
            </DialogTrigger>
            <DialogContent
                className={`max-w-4xl ${needsScroll ? 'max-h-[90vh] overflow-y-auto' : ''}`}
            >
                <DialogHeader>
                    <DialogTitle>Добавить слово из словаря</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex flex-wrap gap-2">
                        <Select
                            value={languageCode}
                            onValueChange={(value: 'en' | 'es') =>
                                setSelectedLanguage(value)
                            }
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="es">🇪🇸 Исп</SelectItem>
                                <SelectItem value="en">🇬🇧 Англ</SelectItem>
                            </SelectContent>
                        </Select>

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
                                        {[
                                            { value: 'VERB', label: 'Глагол' },
                                            {
                                                value: 'NOUN',
                                                label: 'Существительное',
                                            },
                                            {
                                                value: 'ADJECTIVE',
                                                label: 'Прилагательное',
                                            },
                                            {
                                                value: 'ADVERB',
                                                label: 'Наречие',
                                            },
                                            {
                                                value: 'PRONOUN',
                                                label: 'Местоимение',
                                            },
                                        ].map(pos => (
                                            <div
                                                key={pos.value}
                                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    togglePartOfSpeech(
                                                        pos.value,
                                                    );
                                                }}
                                            >
                                                <Checkbox
                                                    checked={selectedPartsOfSpeech.includes(
                                                        pos.value,
                                                    )}
                                                    onCheckedChange={() =>
                                                        togglePartOfSpeech(
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

                        <div className="relative flex-1 min-w-[200px] flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    ref={searchInputRef}
                                    placeholder="Поиск..."
                                    value={searchTerm}
                                    onChange={e =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 pr-10"
                                    onKeyDown={e => {
                                        if (
                                            e.key === 'Enter' &&
                                            !hasExactMatch &&
                                            searchTerm.trim() &&
                                            !aiSearching
                                        ) {
                                            handleAiSearch();
                                        }
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
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
                                onClick={handleAiSearch}
                                disabled={
                                    hasExactMatch ||
                                    !searchTerm.trim() ||
                                    aiSearching
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

                    {/* Список доступных слов */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                                Доступные слова{' '}
                                {searching && (
                                    <Loader2 className="w-4 h-4 animate-spin inline ml-2" />
                                )}
                            </label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={selectAllWords}
                                    disabled={
                                        searching ||
                                        getFilteredWords().length === 0
                                    }
                                >
                                    Выбрать все
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={deselectAllWords}
                                    disabled={searching}
                                >
                                    Отменить все
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-[300px] overflow-y-auto border rounded-md p-3 bg-gray-50">
                                {searching && availableWords.length === 0 ? (
                                    // Скелетон во время загрузки
                                    <>
                                        {[1, 2, 3, 4].map(i => (
                                            <Card
                                                key={i}
                                                className="animate-pulse"
                                            >
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-4 h-4 bg-gray-300 rounded shrink-0"></div>
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                            </Card>
                                        ))}
                                    </>
                                ) : getFilteredWords().length > 0 ? (
                                    getFilteredWords().map(word => (
                                        <Card
                                            key={word.id}
                                            className={`transition-all cursor-pointer h-fit ${
                                                isWordSelected(word.id)
                                                    ? 'ring-2 ring-primary bg-blue-50'
                                                    : 'hover:bg-gray-50 bg-white'
                                            }`}
                                            onClick={() =>
                                                toggleWordSelection(word.id)
                                            }
                                        >
                                            <CardHeader className="pb-2 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <Checkbox
                                                            checked={isWordSelected(
                                                                word.id,
                                                            )}
                                                            onChange={() => {}} // отключаем прямое взаимодействие с чекбоксом
                                                            className="shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                                                                <span className="truncate">
                                                                    {word.word}
                                                                </span>
                                                                <span className="text-sm shrink-0">
                                                                    {getLanguageFlag(
                                                                        word
                                                                            .language
                                                                            .code,
                                                                    )}
                                                                </span>
                                                                {word.partOfSpeech && (
                                                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded shrink-0">
                                                                        {getPartOfSpeechAbbrev(
                                                                            word
                                                                                .partOfSpeech
                                                                                .displayName,
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </CardTitle>
                                                            <div className="flex items-center gap-1">
                                                                <span
                                                                    className={`truncate text-sm cursor-pointer hover:text-blue-600 transition-colors ${
                                                                        word
                                                                            .translations
                                                                            .length >
                                                                            0 ||
                                                                        (word.customTranslations &&
                                                                            word
                                                                                .customTranslations
                                                                                .length >
                                                                                0)
                                                                            ? 'text-blue-500'
                                                                            : 'text-gray-500'
                                                                    }`}
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        if (
                                                                            word.isAddedByUser &&
                                                                            (word
                                                                                .translations
                                                                                .length >
                                                                                0 ||
                                                                                (word.customTranslations &&
                                                                                    word
                                                                                        .customTranslations
                                                                                        .length >
                                                                                        0))
                                                                        ) {
                                                                            openTranslationDialog(
                                                                                word,
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    {getCurrentTranslation(
                                                                        word,
                                                                    )}
                                                                </span>
                                                                {(word
                                                                    .translations
                                                                    .length >
                                                                    0 ||
                                                                    (word.customTranslations &&
                                                                        word
                                                                            .customTranslations
                                                                            .length >
                                                                            0)) && (
                                                                    <span className="text-xs text-gray-400 shrink-0">
                                                                        (
                                                                        {word
                                                                            .translations
                                                                            .length ||
                                                                            0}
                                                                        {word.customTranslations &&
                                                                        word
                                                                            .customTranslations
                                                                            .length >
                                                                            0
                                                                            ? '+1'
                                                                            : ''}
                                                                        )
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {isClient &&
                                                                selectedWordForTranslation &&
                                                                selectedWordForTranslation.baseWordId ===
                                                                    word.id && (
                                                                    <TranslationSelectorDialog
                                                                        word={
                                                                            selectedWordForTranslation
                                                                        }
                                                                        open={
                                                                            translationDialogOpen[
                                                                                word
                                                                                    .id
                                                                            ] ||
                                                                            false
                                                                        }
                                                                        onOpenChange={open =>
                                                                            handleDialogClose(
                                                                                word.id,
                                                                                open,
                                                                            )
                                                                        }
                                                                        onSave={
                                                                            handleTranslationSave
                                                                        }
                                                                        partsOfSpeech={
                                                                            partsOfSpeech
                                                                        }
                                                                    />
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-2 flex flex-col items-center justify-start pt-2 text-center">
                                        <p className="text-gray-500 mb-2">
                                            Слова не найдены
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Попробуйте добавить слово с помощью
                                            кнопки{' '}
                                            <span className="font-semibold text-gray-600">
                                                &quot;Добавить&quot;
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center pt-1 pb-1">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={
                                        searching || loadingMore || !hasMore
                                    }
                                    className={`text-sm text-black underline decoration-dotted decoration-1 underline-offset-2 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${!hasMore && availableWords.length > 0 ? 'invisible' : ''}`}
                                >
                                    Показать еще
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-row justify-end space-x-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Закрыть
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
