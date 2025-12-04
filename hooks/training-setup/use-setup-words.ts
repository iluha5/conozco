import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Word } from '@/types/words.types';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';

const EMPTY_WORDS: Word[] = [];

async function fetchSetupWords(): Promise<Word[]> {
    const response = await fetch('/api/words?status=NOT_LEARNED&limit=120');

    if (!response.ok) {
        throw new Error('Failed to fetch words');
    }

    return response.json();
}

/**
 * Хук для загрузки слов для настройки тренировки с кэшированием через React Query
 */
export const useSetupWords = (
    selectedLanguage: string,
    selectedGroupIds: number[] = [],
) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['words', { status: 'NOT_LEARNED', limit: 120 }],
        queryFn: fetchSetupWords,
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
    });

    // Используем стабильную ссылку на пустой массив
    const words = data ?? EMPTY_WORDS;

    // Логируем ошибку если есть
    if (error) {
        console.error('Error fetching words:', error);
    }

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
        refetch,
    };
};
