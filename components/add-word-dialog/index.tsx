/**
 * Диалог добавления слов из словаря (главный компонент)
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { PlusCircle } from 'lucide-react';
import { usePartsOfSpeech } from '@/hooks/shared';
import { useUserSettings } from '@/hooks/settings';
import {
    useWordSearch,
    useWordManagement,
    useAiSearch,
} from '@/hooks/add-word-dialog';
import { useWordGroupsFilter } from '@/hooks/word-groups/use-word-groups-filter';
import { AddWordDialogFilters } from './AddWordDialogFilters';
import { WordsList as AddWordDialogWordsList } from './WordsList';
import type { BaseWord } from '@/types/add-word-dialog.types';

type AddWordDialogProps = {
    onWordAdded: () => void;
};

export function AddWordDialog({ onWordAdded }: AddWordDialogProps) {
    const [open, setOpen] = useState(false);
    const [needsScroll, setNeedsScroll] = useState(false);
    const [skipAutoSearch, setSkipAutoSearch] = useState(false);
    const [selectedPartsOfSpeech, setSelectedPartsOfSpeech] = useState<
        string[]
    >([]);
    const [translationDialogOpen, setTranslationDialogOpen] = useState<{
        [key: string]: boolean;
    }>({});
    const [selectedWordForTranslation, setSelectedWordForTranslation] =
        useState<any | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [confirmToggleAllDialogOpen, setConfirmToggleAllDialogOpen] =
        useState(false);
    const [pendingToggleAllWords, setPendingToggleAllWords] = useState<
        BaseWord[] | null
    >(null);

    const { settings: userSettings } = useUserSettings();
    const { partsOfSpeech } = usePartsOfSpeech('ru');

    // Используем learnLanguage из настроек пользователя
    const languageCode: 'en' | 'es' = useMemo(() => {
        const code = userSettings?.learnLanguage?.code;
        return code === 'en' || code === 'es' ? code : 'es';
    }, [userSettings?.learnLanguage?.code]);

    // Фильтр по группам
    const { selectedGroupIds, toggleGroup, toggleAll } =
        useWordGroupsFilter('addWordDialog');

    // Хуки для бизнес-логики
    const {
        searchTerm,
        setSearchTerm,
        availableWords,
        setAvailableWords,
        searching,
        loadingMore,
        hasMore,
        hasExactMatch,
        handleSearch,
        handleLoadMore,
        resetSearch,
    } = useWordSearch({
        languageCode,
        open,
        skipAutoSearch,
        setSkipAutoSearch,
        selectedGroupIds,
    });

    const {
        addWord,
        toggleWordSelection,
        selectedWords,
        toggleAllWordsSelection,
        isWordSelected,
        resetSelection,
    } = useWordManagement({
        availableWords,
        setAvailableWords,
        onWordAdded,
    });

    const { aiSearching, handleAiSearch } = useAiSearch({
        searchTerm,
        languageCode,
        setAvailableWords,
        setOffset: (_value: React.SetStateAction<number>) => {
            // Этот setState будет использоваться внутри useAiSearch
        },
        setHasMore: (_value: React.SetStateAction<boolean>) => {
            // Этот setState будет использоваться внутри useAiSearch
        },
        addWord,
    });

    // Инициализация isClient
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Проверка, нужен ли скролл для попапа
    useEffect(() => {
        const checkViewportSize = () => {
            const estimatedDialogHeight = 600;
            const viewportHeight = window.innerHeight;
            setNeedsScroll(viewportHeight * 0.9 < estimatedDialogHeight);
        };

        checkViewportSize();
        window.addEventListener('resize', checkViewportSize);
        return () => window.removeEventListener('resize', checkViewportSize);
    }, []);

    // Функция для фильтрации слов по частям речи
    const getFilteredWords = () => {
        let filtered = availableWords;

        // Фильтр по частям речи (клиентская фильтрация)
        if (selectedPartsOfSpeech.length > 0) {
            filtered = filtered.filter(word => {
                // Проверяем partOfSpeech в переводах
                const hasMatchingTranslation = word.translations?.some(
                    t =>
                        t.partOfSpeech &&
                        selectedPartsOfSpeech.includes(t.partOfSpeech.name),
                );

                return hasMatchingTranslation;
            });
        }

        return filtered;
    };

    const togglePartOfSpeech = (pos: string) => {
        setSelectedPartsOfSpeech(prev =>
            prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos],
        );
    };

    // Преобразование BaseWord в формат Word для TranslationSelectorDialog
    const convertBaseWordToWord = async (
        baseWord: BaseWord,
    ): Promise<any | null> => {
        try {
            const userWordsResponse = await fetch('/api/words');
            if (userWordsResponse.ok) {
                const userWords = await userWordsResponse.json();
                const userWord = userWords.find(
                    (w: any) => w.baseWordId === baseWord.id,
                );

                if (userWord) {
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
        await handleSearch(0, true);
    };

    const resetForm = () => {
        resetSelection();
        resetSearch();
        setSelectedPartsOfSpeech([]);
        setSkipAutoSearch(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            resetForm();
        }
    };

    const filteredWords = getFilteredWords();

    const handleToggleAllSelectionClick = () => {
        setPendingToggleAllWords(filteredWords);
        setConfirmToggleAllDialogOpen(true);
    };

    const handleConfirmToggleAll = async () => {
        if (pendingToggleAllWords) {
            await toggleAllWordsSelection(pendingToggleAllWords);
            setPendingToggleAllWords(null);
        }
        setConfirmToggleAllDialogOpen(false);
    };

    const handleCloseToggleAllDialog = () => {
        setConfirmToggleAllDialogOpen(false);
        setPendingToggleAllWords(null);
    };

    const selectionState = useMemo(() => {
        const allSelected = filteredWords.every(word =>
            selectedWords.includes(word.id),
        );
        const hasSelection = filteredWords.some(word =>
            selectedWords.includes(word.id),
        );

        if (!hasSelection) return 'none';
        if (allSelected) return 'all';
        return 'partial';
    }, [filteredWords, selectedWords]);

    // Подсчитываем количество слов, которые реально будут добавлены или удалены
    const wordsToProcessCount = useMemo(() => {
        if (!pendingToggleAllWords) return 0;

        if (selectionState === 'all') {
            // Будем удалять - считаем только те, что уже добавлены пользователем
            return pendingToggleAllWords.filter(word => word.isAddedByUser)
                .length;
        } else {
            // Будем добавлять - считаем только те, что еще не добавлены пользователем
            return pendingToggleAllWords.filter(word => !word.isAddedByUser)
                .length;
        }
    }, [pendingToggleAllWords, selectionState]);

    const actionText =
        selectionState === 'all'
            ? 'удалены из списка ваших слов'
            : 'добавлено в список ваших слов';
    const actionTitle =
        selectionState === 'all' ? 'Убрать слова?' : 'Добавить слова?';

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button size="lg" className="w-full min-w-0">
                        <PlusCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="md:hidden truncate">Добавить</span>
                        <span className="hidden md:inline truncate">
                            Добавить слово
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent
                    className={`${needsScroll ? 'max-h-[90vh] overflow-y-auto' : ''}`}
                >
                    <DialogHeader>
                        <DialogTitle>Добавить слово из словаря</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Фильтры */}
                        <AddWordDialogFilters
                            selectedPartsOfSpeech={selectedPartsOfSpeech}
                            onTogglePartOfSpeech={togglePartOfSpeech}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            hasExactMatch={hasExactMatch}
                            aiSearching={aiSearching}
                            onAiSearch={handleAiSearch}
                            autoFocus={open}
                            selectedGroupIds={selectedGroupIds}
                            onToggleGroup={toggleGroup}
                            onToggleAllGroups={toggleAll}
                            words={filteredWords}
                            selectedWords={selectedWords}
                            onToggleAllSelection={handleToggleAllSelectionClick}
                            searching={searching}
                            filteredWordsCount={filteredWords.length}
                        />

                        {/* Список слов */}
                        <AddWordDialogWordsList
                            words={filteredWords}
                            searching={searching}
                            loadingMore={loadingMore}
                            hasMore={hasMore}
                            isWordSelected={isWordSelected}
                            onToggleWord={toggleWordSelection}
                            selectedWords={selectedWords}
                            onToggleAllSelection={handleToggleAllSelectionClick}
                            onLoadMore={handleLoadMore}
                            onOpenTranslationDialog={openTranslationDialog}
                            translationDialogOpen={translationDialogOpen}
                            onTranslationDialogClose={handleDialogClose}
                            selectedWordForTranslation={
                                selectedWordForTranslation
                            }
                            partsOfSpeech={partsOfSpeech}
                            onTranslationSave={handleTranslationSave}
                            isClient={isClient}
                            searchTerm={searchTerm}
                        />
                    </div>

                    <DialogFooter className="flex-row justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Закрыть
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог подтверждения выбора всех слов */}
            <Dialog
                open={confirmToggleAllDialogOpen}
                onOpenChange={handleCloseToggleAllDialog}
            >
                <DialogContent className={`sm:max-w-xl`}>
                    <DialogHeader>
                        <DialogTitle>{actionTitle}</DialogTitle>
                        <DialogDescription className="!mt-3">
                            {wordsToProcessCount > 0 ? (
                                <>
                                    {wordsToProcessCount} слов(а) будет{' '}
                                    {actionText}.
                                </>
                            ) : (
                                <>
                                    Все видимые слова уже{' '}
                                    {selectionState === 'all'
                                        ? 'удалены'
                                        : 'добавлены'}
                                    .
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleCloseToggleAllDialog}
                        >
                            Отмена
                        </Button>
                        <Button onClick={handleConfirmToggleAll}>
                            Подтвердить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
