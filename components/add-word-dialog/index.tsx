/**
 * Диалог добавления слов из словаря (главный компонент)
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { useTrainingSelection, usePartsOfSpeech } from '@/hooks/shared';
import {
    useWordSearch,
    useWordManagement,
    useAiSearch,
} from '@/hooks/add-word-dialog';
import { AddWordDialogFilters } from './filters';
import { WordsList } from './words-list';
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

    const { selectedLanguage, setSelectedLanguage } = useTrainingSelection();
    const { partsOfSpeech } = usePartsOfSpeech('ru');

    // Преобразуем selectedLanguage для использования в диалоге
    const languageCode: 'en' | 'es' =
        selectedLanguage === 'en' || selectedLanguage === 'es'
            ? selectedLanguage
            : 'es';

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
    });

    const {
        selectedWords,
        addWord,
        toggleWordSelection,
        selectAllWords,
        deselectAllWords,
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
        setOffset: (value: React.SetStateAction<number>) => {
            // Этот setState будет использоваться внутри useAiSearch
        },
        setHasMore: (value: React.SetStateAction<boolean>) => {
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
        if (selectedPartsOfSpeech.length === 0) {
            return availableWords;
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
                    {/* Фильтры */}
                    <AddWordDialogFilters
                        languageCode={languageCode}
                        onLanguageChange={(value: 'en' | 'es') =>
                            setSelectedLanguage(value)
                        }
                        selectedPartsOfSpeech={selectedPartsOfSpeech}
                        onTogglePartOfSpeech={togglePartOfSpeech}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        hasExactMatch={hasExactMatch}
                        aiSearching={aiSearching}
                        onAiSearch={handleAiSearch}
                        autoFocus={open}
                    />

                    {/* Список слов */}
                    <WordsList
                        words={filteredWords}
                        searching={searching}
                        loadingMore={loadingMore}
                        hasMore={hasMore}
                        isWordSelected={isWordSelected}
                        onToggleWord={toggleWordSelection}
                        onSelectAll={() => selectAllWords(filteredWords)}
                        onDeselectAll={() => deselectAllWords(filteredWords)}
                        onLoadMore={handleLoadMore}
                        onOpenTranslationDialog={openTranslationDialog}
                        translationDialogOpen={translationDialogOpen}
                        onTranslationDialogClose={handleDialogClose}
                        selectedWordForTranslation={selectedWordForTranslation}
                        partsOfSpeech={partsOfSpeech}
                        onTranslationSave={handleTranslationSave}
                        isClient={isClient}
                    />
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
