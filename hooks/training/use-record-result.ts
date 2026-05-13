import { useCallback } from 'react';
import { useTrainingStorage } from './use-training-storage';
import type { TrainingStage } from '@/types/training.types';

export interface UseRecordResultReturn {
    recordResult: (
        _stage: TrainingStage,
        _wordId: string,
        _isCorrect: boolean,
    ) => Promise<boolean>;
    recordLocalResult: (
        _stage: TrainingStage,
        _wordId: string,
        _isCorrect: boolean,
    ) => void;
}

export function useRecordResult(): UseRecordResultReturn {
    const storage = useTrainingStorage();

    const recordApiResult = useCallback(
        async (
            stage: TrainingStage,
            wordId: string,
            isCorrect: boolean,
        ): Promise<boolean> => {
            try {
                const response = await fetch('/api/training', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ wordId, stage, isCorrect }),
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

    const recordLocalResult = useCallback(
        (stage: TrainingStage, wordId: string, isCorrect: boolean) => {
            storage.recordAttempt(stage, wordId, isCorrect);
        },
        [storage],
    );

    const recordResult = useCallback(
        async (
            stage: TrainingStage,
            wordId: string,
            isCorrect: boolean,
        ): Promise<boolean> => {
            recordLocalResult(stage, wordId, isCorrect);
            return recordApiResult(stage, wordId, isCorrect);
        },
        [recordApiResult, recordLocalResult],
    );

    return { recordResult, recordLocalResult };
}
