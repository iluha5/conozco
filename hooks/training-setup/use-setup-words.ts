import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word } from '@/types/words.types';
import { useToast } from '@/hooks/shared';

export const useSetupWords = (
    selectedLanguage: string,
    selectedGroupIds: number[] = [],
) => {
    const [words, setWords] = useState<Word[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchWords = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                '/api/words?status=NOT_LEARNED&limit=120',
            );
            if (!response.ok) {
                throw new Error('Failed to fetch words');
            }
            const data = await response.json();
            setWords(data);
        } catch (error) {
            console.error('Error fetching words:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить слова',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    // Мемоизация фильтрованных слов
    const filteredWords = useMemo(() => {
        let filtered = words;

        // Фильтр по языку
        if (selectedLanguage !== 'ALL') {
            filtered = filtered.filter(
                word => word.language.code === selectedLanguage,
            );
        }

        // Фильтр по группам
        if (selectedGroupIds.length > 0) {
            filtered = filtered.filter(word => {
                if (!word.baseWord?.wordGroups) return false;
                return word.baseWord.wordGroups.some(wg =>
                    selectedGroupIds.includes(wg.wordGroupId),
                );
            });
        }

        return filtered;
    }, [words, selectedLanguage, selectedGroupIds]);

    return {
        words,
        filteredWords,
        isLoading,
        refetch: fetchWords,
    };
};
