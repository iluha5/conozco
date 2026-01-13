import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Word } from '@/types/training.types';
import { useToast } from '@/hooks/shared';
import { FlashCardsReviewParams } from '../typing';
import { useTranslation } from '@/lib/i18n';

/**
 * Хук для мутаций с оптимистичными обновлениями для flash cards
 */
export function useFlashCardsMutations(params: FlashCardsReviewParams) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { t } = useTranslation();

    // Query key for words cache
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
            // If word not in dictionary, create it first
            if (!belongsToUser && baseWordId) {
                // Extract baseWordId from wordId if in "base-{id}" format
                const actualBaseWordId = wordId.startsWith('base-')
                    ? wordId.replace('base-', '')
                    : baseWordId;

                // Create word
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

            // Update status
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
            // Cancel current requests
            await queryClient.cancelQueries({ queryKey });

            // Save previous value
            const previousWords = queryClient.getQueryData<Word[]>(queryKey);

            // Optimistically remove word from list
            queryClient.setQueryData<Word[]>(queryKey, oldWords => {
                if (!oldWords) return [];
                return oldWords.filter(word => word.id !== wordId);
            });

            return { previousWords };
        },
        onError: (error, variables, context) => {
            // Rollback changes
            if (context?.previousWords) {
                queryClient.setQueryData(queryKey, context.previousWords);
            }

            toast({
                title: t('Error'),
                description:
                    error instanceof Error
                        ? error.message
                        : t('Failed to change word status'),
                variant: 'destructive',
            });
        },
        onSettled: () => {
            // Update cache for synchronization with other components
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
            // Cancel current requests
            await queryClient.cancelQueries({ queryKey });

            // Save previous value
            const previousWords = queryClient.getQueryData<Word[]>(queryKey);

            // Optimistically remove word from list
            queryClient.setQueryData<Word[]>(queryKey, oldWords => {
                if (!oldWords) return [];
                return oldWords.filter(word => word.id !== wordId);
            });

            return { previousWords };
        },
        onError: (error, wordId, context) => {
            // Rollback changes
            if (context?.previousWords) {
                queryClient.setQueryData(queryKey, context.previousWords);
            }

            toast({
                title: t('Error'),
                description:
                    error instanceof Error
                        ? error.message
                        : t('Failed to delete word'),
                variant: 'destructive',
            });
        },
        onSettled: () => {
            // Update cache for synchronization with other components
            queryClient.invalidateQueries({ queryKey: ['words'] });
        },
    });

    return {
        updateWordStatus,
        deleteWord,
    };
}
