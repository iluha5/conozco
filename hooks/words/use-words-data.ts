import { useState, useEffect, useCallback } from 'react';
import { Word } from '@/types/words.types';
import { useToast } from '@/hooks/shared';

export const useWordsData = () => {
    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchWords = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/words');
            if (response.ok) {
                const data = await response.json();
                setWords(data);
            } else {
                throw new Error('Failed to fetch words');
            }
        } catch (error) {
            console.error('Error fetching words:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить слова',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchWords();
    }, [fetchWords]);

    return {
        words,
        loading,
        refetch: fetchWords,
    };
};
