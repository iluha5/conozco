/**
 * Хук для AI-поиска слов
 */

import { useState } from 'react';
import { useToast } from '@/hooks/shared';
import type { BaseWord } from '@/types/add-word-dialog.types';

type UseAiSearchProps = {
    searchTerm: string;
    languageCode: 'en' | 'es';
    setAvailableWords: React.Dispatch<React.SetStateAction<BaseWord[]>>;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
    addWord: (baseWordId: string) => Promise<boolean>;
};

export function useAiSearch({
    searchTerm,
    languageCode,
    setAvailableWords,
    setOffset,
    setHasMore,
    addWord,
}: UseAiSearchProps) {
    const [aiSearching, setAiSearching] = useState(false);
    const { toast } = useToast();

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

                // Обновляем список слов
                setTimeout(async () => {
                    setOffset(0);
                    setHasMore(true);

                    const params = new URLSearchParams({
                        languageCode,
                        limit: '30',
                        offset: '0',
                    });

                    if (searchTerm.trim()) {
                        params.set('search', searchTerm.trim());
                    }

                    const response = await fetch(`/api/base-words?${params}`);
                    if (response.ok) {
                        const words = await response.json();
                        setAvailableWords(words);
                        setHasMore(words.length === 30);
                        setOffset(words.length);

                        // Добавляем найденное слово в список пользователя
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

    return {
        aiSearching,
        handleAiSearch,
    };
}
