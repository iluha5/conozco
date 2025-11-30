import { useState, useEffect, useCallback } from 'react';
import { generateOptions } from '../helpers/generateOptions';
import type { Word } from '@/types/training.types';

export function useTranslationOptions(
    currentWord: Word | undefined,
    currentIndex: number,
    allWords: Word[],
) {
    const [options, setOptions] = useState<string[]>([]);

    const generateAndSetOptions = useCallback(() => {
        if (currentWord) {
            const newOptions = generateOptions(
                currentWord,
                currentIndex,
                allWords,
            );
            setOptions(newOptions);
        }
    }, [currentWord, currentIndex, allWords]);

    useEffect(() => {
        generateAndSetOptions();
    }, [generateAndSetOptions]);

    return {
        options,
        regenerateOptions: generateAndSetOptions,
    };
}
