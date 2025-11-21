/**
 * Хук для записи результатов тренировки
 * Объединяет запись в БД (API) и localStorage
 */

import { useCallback } from 'react';
import { useTrainingStorage } from './use-training-storage';
import type { TrainingStage } from '@/types/training.types';

export interface UseRecordResultReturn {
    /**
     * Записать результат упражнения
     * @param stage - Номер этапа (1-6)
     * @param wordId - ID слова
     * @param isCorrect - Правильный ли ответ
     * @returns Promise<boolean> - true если успешно, false если ошибка
     */
    recordResult: (
        stage: TrainingStage,
        wordId: string,
        isCorrect: boolean,
    ) => Promise<boolean>;

    /**
     * Записать только в localStorage (без API запроса)
     */
    recordLocalResult: (
        stage: TrainingStage,
        wordId: string,
        isCorrect: boolean,
    ) => void;
}

export function useRecordResult(): UseRecordResultReturn {
    const storage = useTrainingStorage();

    /**
     * Записать результат в БД через API
     */
    const recordApiResult = useCallback(
        async (
            stage: TrainingStage,
            wordId: string,
            isCorrect: boolean,
        ): Promise<boolean> => {
            try {
                const response = await fetch('/api/training', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        wordId,
                        stage,
                        isCorrect,
                    }),
                });

                if (!response.ok) {
                    console.error(
                        'Failed to record training result:',
                        response.statusText,
                    );
                    return false;
                }

                return true;
            } catch (error) {
                console.error('Error recording training result:', error);
                return false;
            }
        },
        [],
    );

    /**
     * Записать результат только в localStorage
     */
    const recordLocalResult = useCallback(
        (stage: TrainingStage, wordId: string, isCorrect: boolean) => {
            storage.recordAttempt(stage, wordId, isCorrect);
        },
        [storage],
    );

    /**
     * Записать результат везде (API + localStorage)
     */
    const recordResult = useCallback(
        async (
            stage: TrainingStage,
            wordId: string,
            isCorrect: boolean,
        ): Promise<boolean> => {
            // Сначала записываем в localStorage (синхронно)
            recordLocalResult(stage, wordId, isCorrect);

            // Затем в API (асинхронно)
            const apiSuccess = await recordApiResult(stage, wordId, isCorrect);

            return apiSuccess;
        },
        [recordApiResult, recordLocalResult],
    );

    return {
        recordResult,
        recordLocalResult,
    };
}
