import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Word } from '@/types/training.types';
import { FlashCardsReviewParams, FlashCardsReviewStats } from '../typing';
import { useFlashCardsMutations } from './useFlashCardsMutations';
import { useUserSettings } from '@/hooks/settings/use-user-settings';

/**
 * Загрузка слов для проверки
 */
async function fetchReviewWords(
    params: FlashCardsReviewParams,
): Promise<Word[]> {
    const searchParams = new URLSearchParams();

    if (params.status) {
        searchParams.append('status', params.status);
    }
    if (params.limit) {
        searchParams.append('limit', params.limit.toString());
    }
    if (params.random !== undefined) {
        searchParams.append('random', params.random.toString());
    }
    if (params.groupIds && params.groupIds.length > 0) {
        searchParams.append('groupIds', params.groupIds.join(','));
    }
    if (params.languageCode) {
        searchParams.append('languageCode', params.languageCode);
    }

    const response = await fetch(
        `/api/words/review?${searchParams.toString()}`,
    );

    if (!response.ok) {
        throw new Error('Failed to fetch review words');
    }

    return response.json();
}

/**
 * Хук для управления тренировкой с карточками
 */
export function useFlashCardsReview(
    params: FlashCardsReviewParams,
    enabled: boolean = true,
) {
    const { settings: userSettings } = useUserSettings();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stats, setStats] = useState<FlashCardsReviewStats>({
        total: 0,
        known: 0,
        dontKnow: 0,
        deleted: 0,
    });
    const [isCompleted, setIsCompleted] = useState(false);
    const [sessionId] = useState(() => Date.now().toString());

    // Определяем язык для фильтрации
    const reviewParams: FlashCardsReviewParams = {
        ...params,
        languageCode:
            params.languageCode ||
            userSettings?.learnLanguage?.code ||
            undefined,
    };

    // Загружаем слова с уникальным sessionId для перемешивания при каждом открытии
    const {
        data: words = [],
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['flash-cards-words', reviewParams, sessionId],
        queryFn: () => fetchReviewWords(reviewParams),
        staleTime: 0, // Не кэшируем, чтобы каждый раз получать новый набор
        gcTime: 0, // Не храним в кэше
        enabled: enabled && !!userSettings?.learnLanguage?.code,
    });

    // Мутации для действий с карточками
    const { updateWordStatus, deleteWord } =
        useFlashCardsMutations(reviewParams);

    // Инициализируем статистику при загрузке слов
    useEffect(() => {
        if (words.length > 0 && currentIndex === 0 && stats.total === 0) {
            setStats({
                total: words.length,
                known: 0,
                dontKnow: 0,
                deleted: 0,
            });
            setCurrentIndex(0);
            setIsCompleted(false);
        }
    }, [words.length, currentIndex, stats.total]);

    // Синхронизируем currentIndex с актуальным списком слов
    useEffect(() => {
        if (currentIndex >= words.length && words.length > 0) {
            setIsCompleted(true);
        } else if (currentIndex < words.length && isCompleted) {
            setIsCompleted(false);
        }
    }, [currentIndex, words.length, isCompleted]);

    // Обработка действия с карточкой
    const handleAction = useCallback(
        async (action: 'know' | 'dont-know' | 'delete') => {
            const currentWord = words[currentIndex];
            if (!currentWord) return;

            // Обновляем статистику сразу (оптимистично)
            if (action === 'delete') {
                setStats(prev => ({
                    ...prev,
                    deleted: prev.deleted + 1,
                }));
            } else if (action === 'dont-know') {
                setStats(prev => ({
                    ...prev,
                    dontKnow: prev.dontKnow + 1,
                }));
            } else if (action === 'know') {
                setStats(prev => ({
                    ...prev,
                    known: prev.known + 1,
                }));
            }

            // Переходим к следующей карточке сразу (оптимистично)
            const nextIndex = currentIndex + 1;
            if (nextIndex >= words.length) {
                setIsCompleted(true);
            } else {
                setCurrentIndex(nextIndex);
            }

            // Выполняем мутацию в фоне
            try {
                if (action === 'delete') {
                    await deleteWord.mutateAsync(currentWord.id);
                } else if (action === 'dont-know') {
                    await updateWordStatus.mutateAsync({
                        wordId: currentWord.id,
                        status: 'NOT_LEARNED',
                    });
                }
                // Для 'know' не нужно делать запрос, статус уже LEARNED
            } catch (error) {
                console.error('Error handling card action:', error);
                // Ошибка уже обработана в мутации через toast
                // Откатываем переход к следующей карточке
                setCurrentIndex(currentIndex);
                // Откатываем статистику
                if (action === 'delete') {
                    setStats(prev => ({
                        ...prev,
                        deleted: Math.max(0, prev.deleted - 1),
                    }));
                } else if (action === 'dont-know') {
                    setStats(prev => ({
                        ...prev,
                        dontKnow: Math.max(0, prev.dontKnow - 1),
                    }));
                } else if (action === 'know') {
                    setStats(prev => ({
                        ...prev,
                        known: Math.max(0, prev.known - 1),
                    }));
                }
                if (isCompleted) {
                    setIsCompleted(false);
                }
            }
        },
        [currentIndex, words, deleteWord, updateWordStatus, isCompleted],
    );

    // Получаем текущее слово с учетом того, что слова могут удаляться из списка
    const currentWord = useMemo(() => {
        if (currentIndex >= words.length || words.length === 0) {
            return null;
        }
        return words[currentIndex] || null;
    }, [words, currentIndex]);

    const progress = useMemo(() => {
        if (words.length === 0) return 0;
        return (currentIndex / words.length) * 100;
    }, [currentIndex, words.length]);

    return {
        words,
        currentWord,
        currentIndex,
        totalWords: words.length,
        isLoading,
        error,
        isCompleted,
        stats,
        progress,
        handleAction,
        refetch,
    };
}
