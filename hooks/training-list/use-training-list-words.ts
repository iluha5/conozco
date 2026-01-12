import { useQuery } from '@tanstack/react-query';
import { Word } from '@/types/training.types';
import { QUERY_STALE_TIME, QUERY_GC_TIME } from '@/config/react-query';
import { trainingApi } from '@/lib/api/training.api';

const EMPTY_WORDS: Word[] = [];

/**
 * Хук для загрузки слов для страницы списка тренировок
 * Фильтрует слова по изучаемому языку пользователя
 * Поддерживает фоновую загрузку с stale-while-revalidate
 */
export function useTrainingListWords(languageCode: string | null) {
    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ['training-list-words', languageCode],
        queryFn: async () => {
            if (!languageCode) {
                return EMPTY_WORDS;
            }
            return trainingApi.fetchWords(undefined, languageCode);
        },
        enabled: !!languageCode,
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
        refetchOnMount: true, // Инвалидировать при каждом заходе на страницу
    });

    // Используем стабильную ссылку на пустой массив
    const words = data ?? EMPTY_WORDS;

    // Логируем ошибку если есть
    if (error) {
        console.error('Error fetching training list words:', error);
    }

    return {
        words,
        isLoading: isLoading && !data, // isLoading только если данных нет
        isFetching, // Для отслеживания фоновой загрузки
    };
}
