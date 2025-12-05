import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Word } from '@/types/training.types';
import { useToast } from '@/hooks/shared';
import { FlashCardsReviewParams } from '../typing';

/**
 * Хук для мутаций с оптимистичными обновлениями для flash cards
 */
export function useFlashCardsMutations(params: FlashCardsReviewParams) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Query key для кэша слов
    const queryKey = ['flash-cards-words', params];

    /**
     * Обновление статуса слова
     * Если слова нет в словаре пользователя (belongsToUser=false), сначала создает его
     */
    const updateWordStatus = useMutation({
        mutationFn: async ({
            wordId,
            status,
            baseWordId,
            belongsToUser,
        }: {
            wordId: string;
            status: 'LEARNED' | 'NOT_LEARNED';
            baseWordId?: string;
            belongsToUser?: boolean;
        }) => {
            // Если слова нет в словаре, сначала создаем его
            if (!belongsToUser && baseWordId) {
                // Извлекаем baseWordId из wordId если он в формате "base-{id}"
                const actualBaseWordId = wordId.startsWith('base-')
                    ? wordId.replace('base-', '')
                    : baseWordId;

                // Создаем слово
                const createResponse = await fetch('/api/words', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ baseWordId: actualBaseWordId }),
                });

                if (!createResponse.ok) {
                    const error = await createResponse.json();
                    throw new Error(
                        error.error || 'Failed to create word in dictionary',
                    );
                }

                const createdWord = await createResponse.json();
                wordId = createdWord.id;
            }

            // Обновляем статус
            const response = await fetch(`/api/words/${wordId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update word status');
            }

            return response.json();
        },
        onMutate: async ({ wordId }) => {
            // Отменяем текущие запросы
            await queryClient.cancelQueries({ queryKey });

            // Сохраняем предыдущее значение
            const previousWords = queryClient.getQueryData<Word[]>(queryKey);

            // Оптимистично удаляем слово из списка
            queryClient.setQueryData<Word[]>(queryKey, oldWords => {
                if (!oldWords) return [];
                return oldWords.filter(word => word.id !== wordId);
            });

            return { previousWords };
        },
        onError: (error, variables, context) => {
            // Откатываем изменения
            if (context?.previousWords) {
                queryClient.setQueryData(queryKey, context.previousWords);
            }

            toast({
                title: 'Ошибка',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Не удалось изменить статус слова',
                variant: 'destructive',
            });
        },
        onSettled: () => {
            // Обновляем кэш для синхронизации с другими компонентами
            queryClient.invalidateQueries({ queryKey: ['words'] });
        },
    });

    /**
     * Удаление слова
     */
    const deleteWord = useMutation({
        mutationFn: async (wordId: string) => {
            const response = await fetch(`/api/words/${wordId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete word');
            }

            return response.json();
        },
        onMutate: async wordId => {
            // Отменяем текущие запросы
            await queryClient.cancelQueries({ queryKey });

            // Сохраняем предыдущее значение
            const previousWords = queryClient.getQueryData<Word[]>(queryKey);

            // Оптимистично удаляем слово из списка
            queryClient.setQueryData<Word[]>(queryKey, oldWords => {
                if (!oldWords) return [];
                return oldWords.filter(word => word.id !== wordId);
            });

            return { previousWords };
        },
        onError: (error, wordId, context) => {
            // Откатываем изменения
            if (context?.previousWords) {
                queryClient.setQueryData(queryKey, context.previousWords);
            }

            toast({
                title: 'Ошибка',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Не удалось удалить слово',
                variant: 'destructive',
            });
        },
        onSettled: () => {
            // Обновляем кэш для синхронизации с другими компонентами
            queryClient.invalidateQueries({ queryKey: ['words'] });
        },
    });

    return {
        updateWordStatus,
        deleteWord,
    };
}
