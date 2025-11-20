import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word } from '@/types/words.types';
import { useToast } from '@/hooks/shared';

export const useSetupWords = (selectedLanguage: string) => {
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
        if (selectedLanguage === 'ALL') {
            return words;
        }
        return words.filter(word => word.language.code === selectedLanguage);
    }, [words, selectedLanguage]);

    return {
        words,
        filteredWords,
        isLoading,
        refetch: fetchWords,
    };
};
