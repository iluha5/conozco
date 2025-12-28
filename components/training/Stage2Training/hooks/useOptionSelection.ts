import { useState, useCallback } from 'react';
import { getWordTranslation } from '@/lib/training-utils';
import { useI18n } from '@/lib/i18n';
import type { Word } from '@/types/training.types';
import type { UseRecordResultReturn } from '@/hooks/training';
import type { UseExerciseResultsReturn } from '@/hooks/training';

type UseOptionSelectionParams = {
    currentWord: Word;
    currentIndex: number;
    updateResult: UseExerciseResultsReturn['updateResult'];
    recordResult: UseRecordResultReturn['recordResult'];
};

export function useOptionSelection({
    currentWord,
    currentIndex,
    updateResult,
    recordResult,
}: UseOptionSelectionParams) {
    const i18n = useI18n();
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const handleSelectOption = useCallback(
        async (option: string) => {
            if (selectedOption !== null) return; // Уже выбрано

            setSelectedOption(option);
            const correctTranslation = getWordTranslation(
                currentWord,
                i18n.language || 'en',
            );
            const correct = option === correctTranslation;
            setIsCorrect(correct);

            // Обновляем результаты упражнения
            updateResult(currentIndex, correct);

            // Записываем результат (API + localStorage)
            await recordResult(2, currentWord.id, correct);
        },
        [
            selectedOption,
            currentWord,
            i18n.language,
            updateResult,
            currentIndex,
            recordResult,
        ],
    );

    const resetSelection = useCallback(() => {
        setSelectedOption(null);
        setIsCorrect(null);
    }, []);

    return {
        selectedOption,
        isCorrect,
        handleSelectOption,
        resetSelection,
    };
}
