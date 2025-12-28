/**
 * Хук для AI-поиска слов
 */

import { useState } from 'react';
import { useToast } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import type { BaseWord } from '@/types/add-word-dialog.types';

type UseAiSearchProps = {
    searchTerm: string;
    languageCode: 'en' | 'es';
    setAvailableWords: React.Dispatch<React.SetStateAction<BaseWord[]>>;
    setOffset: React.Dispatch<React.SetStateAction<number>>;
    setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
    addWord: (_baseWordId: string) => Promise<boolean>;
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
    const { t } = useTranslation();

    const handleAiSearch = async () => {
        if (!searchTerm.trim()) {
            toast({
                title: t('Error'),
                description: t('Enter a word to search'),
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
                    ? t(
                          'Word "{{word}}" already exists in database{{examples}}',
                          {
                              word: addedWord,
                              examples:
                                  data.foundExamples > 0
                                      ? ` (${data.foundExamples} ${t('examples')})`
                                      : '',
                          },
                      )
                    : t('Word "{{word}}" added to database{{examples}}', {
                          word: addedWord,
                          examples:
                              data.foundExamples > 0
                                  ? ` ${t('with')} ${data.foundExamples} ${t('examples')}`
                                  : '',
                      });

                toast({
                    title: t('Success'),
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
                    title: t('Error'),
                    description: data.error || t('Failed to find or add word'),
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error in AI search:', error);
            toast({
                title: t('Error'),
                description: t('An error occurred while searching for word'),
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
