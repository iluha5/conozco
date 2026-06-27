import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Word } from '@/types/training.types';
import { useToast } from '@/hooks/shared';
import { FlashCardsReviewParams } from '../typing';
import { useTranslation } from '@/lib/i18n';

export function useFlashCardsMutations(params: FlashCardsReviewParams) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { t } = useTranslation();

    const queryKey = ['flash-cards-words', params];

    // If word does not belong to user (belongsToUser=false), create it before
    // updating its status.
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
            if (!belongsToUser && baseWordId) {
                // wordId may be in "base-{id}" format
                const actualBaseWordId = wordId.startsWith('base-')
                    ? wordId.replace('base-', '')
                    : baseWordId;

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
            await queryClient.cancelQueries({ queryKey });

            const previousWords = queryClient.getQueryData<Word[]>(queryKey);

            queryClient.setQueryData<Word[]>(queryKey, oldWords => {
                if (!oldWords) return [];
                return oldWords.filter(word => word.id !== wordId);
            });

            return { previousWords };
        },
        onError: (error, variables, context) => {
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
            queryClient.invalidateQueries({ queryKey: ['words'] });
            queryClient.invalidateQueries({ queryKey: ['words-list'] });
            queryClient.invalidateQueries({ queryKey: ['training-stats'] });
        },
    });

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
            await queryClient.cancelQueries({ queryKey });

            const previousWords = queryClient.getQueryData<Word[]>(queryKey);

            queryClient.setQueryData<Word[]>(queryKey, oldWords => {
                if (!oldWords) return [];
                return oldWords.filter(word => word.id !== wordId);
            });

            return { previousWords };
        },
        onError: (error, wordId, context) => {
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
            queryClient.invalidateQueries({ queryKey: ['words'] });
            queryClient.invalidateQueries({ queryKey: ['words-list'] });
            queryClient.invalidateQueries({ queryKey: ['training-stats'] });
        },
    });

    return {
        updateWordStatus,
        deleteWord,
    };
}
